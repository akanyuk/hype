import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage } from '../matrix.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

for (const theme of ['light', 'dark']) {
	test(`mobile topic cards have no frame (${theme})`, async () => {
		const p = await openPage(browser, { skin: 'mobile', path: '/', theme, volatile: false });
		const widths = await p.$$eval('article.topic', (els) => els.map((e) => {
			const s = getComputedStyle(e);
			return [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].join(' ');
		}));
		await p.context.close();
		assert.ok(widths.length > 0);
		assert.deepEqual([...new Set(widths)], ['0px 0px 0px 0px']);
	});
}
