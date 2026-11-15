import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage, SKINS, ROLES } from '../matrix.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

// Large font factors (theme.css): --font-scale-large for the content zone,
// --font-scale-text-large for the main text (topic body, comments)
const LARGE = 1.35;
const LARGE_TEXT = { desktop: 1.45, mobile: 1.6 };
const TOPIC = '/blog/dev/1092.html';
const FIXED = {
	desktop: ['#header', '#nav-main', '#header .auth', '#dropdown-user', '.nav-pills', '.vote', '.vote-count', '#footer'],
	mobile: ['#header', '#userbar', '.nav-pills', '.vote', '.vote-result', '#footer'],
};

// font-size and box of the first element per selector, plus content samples
async function measure(skin, role, font, path) {
	const p = await openPage(browser, { skin, role, font, path, volatile: false });
	const r = await p.evaluate((fixed) => {
		const fs = (sel) => { const e = document.querySelector(sel); return e ? parseFloat(getComputedStyle(e).fontSize) : null; };
		const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; };
		return {
			topic: fs('.topic-content'),
			comment: fs('.comment-content .text, .comment-content.text'),
			sidebar: fs('#sidebar .block-content, #sidebar .block'),
			title: fs('.topic-title'),
			info: fs('.topic-info'),
			fixed: Object.fromEntries(fixed.map((s) => [s, { fs: fs(s), box: box(s) }])),
		};
	}, FIXED[skin]);
	await p.context.close();
	return r;
}

for (const skin of SKINS) {
	for (const role of ROLES) {
		describe(`${skin} ${role}`, () => {
			let normal, large;
			before(async () => {
				normal = await measure(skin, role, 'normal', TOPIC);
				large = await measure(skin, role, 'large', TOPIC);
			});

			test('main-text-scaled', () => {
				assert.ok(Math.abs(large.topic / normal.topic - LARGE_TEXT[skin]) < 0.01, `topic ${normal.topic} → ${large.topic}`);
				assert.ok(Math.abs(large.comment / normal.comment - LARGE_TEXT[skin]) < 0.01, `comment ${normal.comment} → ${large.comment}`);
			});

			test('other-content-scaled', () => {
				assert.ok(Math.abs(large.title / normal.title - LARGE) < 0.01, `title ${normal.title} → ${large.title}`);
				assert.ok(Math.abs(large.info / normal.info - LARGE) < 0.01, `info ${normal.info} → ${large.info}`);
			});

			if (skin === 'desktop') {
				test('sidebar-scaled', () => {
					assert.ok(Math.abs(large.sidebar / normal.sidebar - LARGE) < 0.01, `sidebar ${normal.sidebar} → ${large.sidebar}`);
				});
			}

			test('header-nav-vote-not-scaled', () => {
				for (const [sel, n] of Object.entries(normal.fixed)) {
					if (n.fs === null) continue;
					const l = large.fixed[sel];
					assert.equal(l.fs, n.fs, `${sel} font-size ${n.fs} → ${l.fs}`);
					if (sel === '#header' || sel === '#nav-main') assert.deepEqual(l.box, n.box, `${sel} box`);
				}
			});

			for (const path of ['/', TOPIC, '/profile/nyuk/', ...(role === 'user' ? ['/talk/', '/topic/add/'] : [])]) {
				test(`no-overflow ${path}`, async () => {
					const p = await openPage(browser, { skin, role, font: 'large', path, volatile: false });
					const bad = await p.evaluate(() => {
						const out = [];
						for (const e of document.querySelectorAll('#content *, #sidebar *')) {
							const s = getComputedStyle(e);
							if (s.display === 'none' || s.visibility !== 'visible') continue;
							// Separators whose text is hidden on purpose
							if (e.matches('.markItUpSeparator')) continue;
							if (!e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
							const clipsX = /hidden|clip/.test(s.overflowX) && s.textOverflow !== 'ellipsis' && s.whiteSpace !== 'nowrap';
							const clipsY = /hidden|clip/.test(s.overflowY);
							if ((clipsX && e.scrollWidth > e.clientWidth + 1) || (clipsY && e.scrollHeight > e.clientHeight + 1)) {
								out.push(`${e.tagName.toLowerCase()}.${String(e.className).trim().replace(/\s+/g, '.')} «${e.textContent.trim().slice(0, 30)}»`);
							}
						}
						return out;
					});
					await p.context.close();
					assert.deepEqual(bad, []);
				});
			}
		});
	}
}
