import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage, SKINS, ROLES } from '../matrix.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

// Header heights measured before the toggles were added
const HEADER_HEIGHT = { desktop: 51, mobile: 48 };

async function withPage(opts, fn) {
	const page = await openPage(browser, { path: '/', volatile: false, ...opts });
	try { await fn(page); } finally { await page.context.close(); }
}

const box = (e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };

for (const skin of SKINS) {
	for (const role of ROLES) {
		describe(`${skin} ${role}`, () => {
			test('buttons-present', () => withPage({ skin, role }, async (p) => {
				const r = await p.evaluate(() => ['theme', 'font'].map((n) => {
					const all = document.querySelectorAll(`#header [data-display-toggle="${n}"]`);
					const b = all[0] && all[0].getBoundingClientRect();
					return { count: all.length, visible: !!b && b.width > 0 && b.height > 0 };
				}));
				assert.deepEqual(r, [{ count: 1, visible: true }, { count: 1, visible: true }]);
			}));

			test('click-toggles', () => withPage({ skin, role, system: 'light' }, async (p) => {
				const before = await p.$eval('#header [data-display-toggle="theme"]', (b) => [b.getAttribute('aria-pressed'), b.title]);
				assert.deepEqual(before, ['false', 'Тёмная тема']);
				await p.click('#header [data-display-toggle="theme"]');
				const after = await p.evaluate(() => {
					const b = document.querySelector('#header [data-display-toggle="theme"]');
					return [document.documentElement.getAttribute('data-theme'), b.getAttribute('aria-pressed'), b.title, b.getAttribute('aria-label')];
				});
				assert.deepEqual(after, ['dark', 'true', 'Светлая тема', 'Светлая тема']);
				await p.click('#header [data-display-toggle="font"]');
				const font = await p.$eval('#header [data-display-toggle="font"]', (b) => [document.documentElement.getAttribute('data-font'), b.getAttribute('aria-pressed'), b.title]);
				assert.deepEqual(font, ['large', 'true', 'Обычный шрифт']);
			}));

			test('header-no-overlap', () => withPage({ skin, role }, async (p) => {
				const overlaps = await p.evaluate((skin, role, boxSrc) => {
					const box = new Function(`return ${boxSrc}`)();
					const hit = (a, b) => a.l < b.r - 0.5 && b.l < a.r - 0.5 && a.t < b.b - 0.5 && b.t < a.b - 0.5;
					const buttons = [...document.querySelectorAll('#header [data-display-toggle]')];
					if (skin === 'desktop' && role === 'user' && !document.querySelector('#header .new-messages')) {
						// Simulate the new messages indicator with a wide counter
						const a = document.createElement('a');
						a.className = 'new-messages';
						a.href = '#';
						a.innerHTML = '+99 <i class="icon-synio-new-message"></i>';
						document.querySelector('#header').appendChild(a);
					}
					const neighbours = skin === 'desktop'
						? ['#header .auth', '#dropdown-user', '#header .new-messages', '#header .site-name', '#nav-main']
						: ['#header .site-name', '#userbar-trigger', '#item-auth', '#next-comment-toolbar'];
					const result = [];
					for (const sel of neighbours) {
						const el = document.querySelector(sel);
						if (!el) continue;
						const nb = box(el);
						if (nb.w === 0 || nb.h === 0) continue;
						for (const b of buttons) if (hit(box(b), nb)) result.push(`${b.dataset.displayToggle} × ${sel}`);
					}
					// Visible nav items must not overlap the toggles either
					if (skin === 'desktop') {
						for (const li of document.querySelectorAll('#nav-main > li')) {
							const nb = box(li);
							if (nb.w === 0 || nb.t > 10) continue;
							for (const b of buttons) if (hit(box(b), nb)) result.push(`${b.dataset.displayToggle} × nav li`);
						}
					}
					const [a, b] = buttons.map(box);
					if (hit(a, b)) result.push('theme × font');
					return result;
				}, skin, role, box.toString());
				assert.deepEqual(overlaps, []);
			}));

			test('header-height-same', () => withPage({ skin, role }, async (p) => {
				const h = await p.$eval('#header', (e) => Math.round(e.getBoundingClientRect().height));
				assert.equal(h, HEADER_HEIGHT[skin]);
			}));
		});
	}
}
