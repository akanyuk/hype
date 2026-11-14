import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage } from '../matrix.mjs';
import { parseColor, luminance } from '../lib/color.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

const SKINS = (process.env.THEME_SKINS || 'desktop,mobile').split(',');
const CONTENT = { desktop: '.topic-content, .text', mobile: '.topic-content, .text' };

for (const skin of SKINS) {
	for (const role of ['guest', 'user']) {
		describe(`${skin} ${role}`, () => {
			for (const path of ['/', '/blog/dev/1092.html']) {
				test(`dark-bg-applied ${path}`, async () => {
					const p = await openPage(browser, { skin, role, path, theme: 'dark' });
					const r = await p.evaluate((contentSel) => {
						// First non-transparent background up the tree
						const bg = (e) => {
							for (; e; e = e.parentElement) {
								const c = getComputedStyle(e).backgroundColor;
								if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
							}
							return getComputedStyle(document.documentElement).backgroundColor;
						};
						const content = document.querySelector(contentSel);
						return {
							body: bg(document.body),
							contentBg: bg(content),
							contentText: getComputedStyle(content).color,
						};
					}, CONTENT[skin]);
					await p.context.close();
					const L = (c) => luminance(parseColor(c));
					assert.ok(L(r.body) < 0.05, `body bg ${r.body}`);
					assert.ok(L(r.contentBg) < 0.08, `content bg ${r.contentBg}`);
					assert.ok(L(r.contentText) > 0.5, `content text ${r.contentText}`);
				});
			}
		});
	}
}
