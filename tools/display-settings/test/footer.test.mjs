import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage } from '../matrix.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

const LINES = {
	desktop: ['Powered by LiveStreet CMS', 'Design by xeoart', 'Sources'],
	mobile: ['Powered by LiveStreet CMS', 'Design by DesignMobile', 'Sources'],
};

for (const skin of ['desktop', 'mobile']) {
	test(`${skin} footer credits: three lines, only Sources is a link`, async () => {
		const p = await openPage(browser, { skin, path: '/', volatile: false });
		const r = await p.$eval('#footer .copyright', (el) => ({
			lines: el.innerText.split('\n').map((s) => s.trim()).filter(Boolean),
			links: [...el.querySelectorAll('a')].map((a) => [a.textContent.trim(), a.getAttribute('href')]),
			images: el.querySelectorAll('img').length,
		}));
		await p.context.close();
		assert.deepEqual(r.lines, LINES[skin]);
		assert.deepEqual(r.links, [['Sources', 'https://github.com/akanyuk/hype']]);
		assert.equal(r.images, 0);
	});
}
