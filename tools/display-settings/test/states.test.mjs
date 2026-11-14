import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage } from '../matrix.mjs';
import { parseColor, contrast } from '../lib/color.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

const TOPIC = '/blog/dev/1092.html';

// Text color and effective (first opaque) background of an element
const pairOf = (sel) => {
	const el = document.querySelector(sel);
	if (!el) return null;
	let bg = null;
	for (let e = el; e && !bg; e = e.parentElement) {
		const c = getComputedStyle(e).backgroundColor;
		if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') bg = c;
	}
	return { color: getComputedStyle(el).color, bg: bg || 'rgb(255, 255, 255)' };
};
const ratio = (p) => contrast(parseColor(p.color), parseColor(p.bg));

// States that only appear after interaction, staged directly in the DOM
async function stage(page) {
	return page.evaluate(`(() => {
		const pairOf = ${pairOf.toString()};
		const out = {};
		const comment = document.querySelector('.comment');
		comment.classList.add('comment-current');
		out['comment-current'] = pairOf('.comment-current .comment-content .text, .comment-current .comment-content');
		const text = document.querySelector('.topic-content');
		text.insertAdjacentHTML('beforeend', '<p id="st-p"><mark id="st-mark">mark</mark> <ins id="st-ins">ins</ins></p>');
		out.mark = pairOf('#st-mark');
		out.ins = pairOf('#st-ins');
		document.body.insertAdjacentHTML('beforeend', '<div class="infobox-yellow" id="st-info" style="position:absolute;top:0;left:0">tip</div>');
		out.infobox = pairOf('#st-info');
		if (window.ls && ls.msg) {
			ls.msg.notice('T', 'notice text');
			ls.msg.error('T', 'error text');
		}
		return out;
	})()`);
}

for (const skin of ['desktop', 'mobile']) {
	describe(`${skin} dark states`, () => {
		test('interaction states are readable', async () => {
			const p = await openPage(browser, { skin, role: 'user', path: TOPIC, theme: 'dark' });
			const pairs = await stage(p);
			await new Promise((r) => setTimeout(r, 500));
			Object.assign(pairs, await p.evaluate(`(() => {
				const pairOf = ${pairOf.toString()};
				return { notice: pairOf('.n-notice .n-message, .n-notice'), error: pairOf('.n-error .n-message, .n-error') };
			})()`));
			await p.context.close();
			const bad = Object.entries(pairs).filter(([, v]) => v && ratio(v) < 4.5).map(([k, v]) => `${k} ${ratio(v).toFixed(2)} ${v.color} on ${v.bg}`);
			assert.deepEqual(bad, []);
		});

		test('tag autocomplete has no light background images', async () => {
			const p = await openPage(browser, { skin, role: 'user', path: '/topic/add/', theme: 'dark' });
			await p.focus('#topic_tags');
			await p.keyboard.type('dem', { delay: 80 });
			await p.waitForFunction(() => [...document.querySelectorAll('.ui-autocomplete')].some((e) => e.offsetHeight > 0 && e.children.length), { timeout: 5000 });
			const r = await p.evaluate(() => [...document.querySelectorAll('.ui-autocomplete, .ui-autocomplete *')]
				.map((e) => getComputedStyle(e).backgroundImage).filter((b) => b !== 'none' && /ui-bg_/.test(b)));
			await p.context.close();
			assert.deepEqual(r, []);
		});
	});
}
