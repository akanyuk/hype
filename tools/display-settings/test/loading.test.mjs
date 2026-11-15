// Page loading: self-hosted fonts and lazy images in user content
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage, BASE, SKINS } from '../matrix.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

const FONT = { desktop: 'PT Sans', mobile: 'Open Sans' };
const TOPIC = '/blog/dev/1128.html';

// Opens a page and records every request URL with its response status
async function openRecorded(opts) {
	const requests = [];
	const page = await openPage(browser, {
		volatile: false, ...opts,
		beforeLoad: (p) => p.on('response', (r) => requests.push({ url: r.url(), status: r.status(), type: r.headers()['content-type'] || '' })),
	});
	return { page, requests };
}

for (const skin of SKINS) {
	describe(skin, () => {
		test('fonts come from the site, not Google', async () => {
			const { page, requests } = await openRecorded({ skin, path: '/' });
			const families = await page.evaluate(async () => {
				await document.fonts.ready;
				return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, ''));
			});
			await page.context.close();
			assert.deepEqual(requests.filter((r) => /fonts\.(googleapis|gstatic)\.com/.test(r.url)).map((r) => r.url), []);
			const fonts = requests.filter((r) => /\.woff2(\?|$)/.test(r.url));
			assert.ok(fonts.length > 0, 'woff2 files requested');
			for (const f of fonts) {
				assert.ok(f.url.startsWith(BASE), `${f.url} is on the site`);
				assert.equal(f.status, 200, f.url);
			}
			assert.ok(families.includes(FONT[skin]), `${FONT[skin]} loaded: ${families.join(', ')}`);
		});

		for (const path of ['/', TOPIC]) test(`content images load lazily ${path}`, async () => {
			const { page } = await openRecorded({ skin, path });
			const r = await page.evaluate(() => {
				const content = [...document.querySelectorAll('.topic-content img, .comment-content img')];
				const logo = document.querySelector('#header img, #logo img, .site-name img');
				return {
					content: content.length,
					eager: content.filter((i) => i.getAttribute('loading') !== 'lazy').map((i) => i.src),
					logo: logo ? logo.getAttribute('loading') : 'none',
				};
			});
			await page.context.close();
			assert.ok(r.content > 0, 'page has content images');
			assert.deepEqual(r.eager, []);
			assert.notEqual(r.logo, 'lazy', 'logo loads right away');
		});
	});
}
