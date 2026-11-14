import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage, BASE, SKINS } from '../matrix.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

const attr = (page, name) => page.evaluate((n) => document.documentElement.getAttribute(n), name);
const stored = (page, key) => page.evaluate((k) => localStorage.getItem(k), key);

async function withPage(opts, fn) {
	const page = await openPage(browser, { path: '/', volatile: false, ...opts });
	try { await fn(page); } finally { await page.context.close(); }
}

for (const skin of SKINS) {
	describe(skin, () => {
		test('system-dark-default', () => withPage({ skin, system: 'dark' }, async (p) => {
			assert.equal(await attr(p, 'data-theme'), 'dark');
		}));

		test('system-light-default', () => withPage({ skin, system: 'light' }, async (p) => {
			assert.equal(await attr(p, 'data-theme'), 'light');
			assert.equal(await attr(p, 'data-font'), 'normal');
		}));

		test('stored-overrides-system', () => withPage({ skin, system: 'dark', theme: 'light' }, async (p) => {
			assert.equal(await attr(p, 'data-theme'), 'light');
		}));

		test('applied-before-css', async () => {
			const ctx = await browser.createBrowserContext();
			const page = await ctx.newPage();
			await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
			if (skin === 'mobile') await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
			// Record data-theme at the moment the first stylesheet link enters the DOM
			await page.evaluateOnNewDocument(() => {
				new MutationObserver((recs, obs) => {
					for (const r of recs) for (const n of r.addedNodes) {
						if (n.nodeName === 'LINK' && n.rel === 'stylesheet') {
							window.__themeAtCss = document.documentElement.getAttribute('data-theme');
							obs.disconnect();
							return;
						}
					}
				}).observe(document, { childList: true, subtree: true });
			});
			await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
			assert.equal(await page.evaluate(() => window.__themeAtCss), 'dark');
			await ctx.close();
		});

		test('toggle-persists', () => withPage({ skin }, async (p) => {
			await p.evaluate(() => hypeDisplay.toggle('theme'));
			assert.equal(await stored(p, 'hype-theme'), 'dark');
			await p.reload({ waitUntil: 'domcontentloaded' });
			assert.equal(await attr(p, 'data-theme'), 'dark');
		}));

		test('system-change-live', () => withPage({ skin, system: 'light' }, async (p) => {
			await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
			await p.waitForFunction(() => document.documentElement.getAttribute('data-theme') === 'dark', { timeout: 3000 });
		}));

		test('system-ignored-after-choice', () => withPage({ skin, system: 'light' }, async (p) => {
			await p.evaluate(() => hypeDisplay.set('theme', 'light'));
			await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
			await new Promise((r) => setTimeout(r, 300));
			assert.equal(await attr(p, 'data-theme'), 'light');
		}));

		test('tabs-sync', () => withPage({ skin }, async (p1) => {
			const p2 = await openPage(browser, { skin, path: '/', volatile: false, context: p1.context });
			await p1.evaluate(() => hypeDisplay.set('theme', 'dark'));
			await p2.waitForFunction(() => document.documentElement.getAttribute('data-theme') === 'dark', { timeout: 3000 });
			await p1.evaluate(() => hypeDisplay.set('font', 'large'));
			await p2.waitForFunction(() => document.documentElement.getAttribute('data-font') === 'large', { timeout: 3000 });
		}));

		test('font-toggle', () => withPage({ skin }, async (p) => {
			await p.evaluate(() => hypeDisplay.toggle('font'));
			assert.equal(await attr(p, 'data-font'), 'large');
			assert.equal(await stored(p, 'hype-font'), 'large');
		}));

		test('theme-color-meta', () => withPage({ skin }, async (p) => {
			const meta = () => p.evaluate(() => [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.content));
			const header = () => p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg-header').trim());
			assert.deepEqual(await meta(), ['#000000']);
			await p.evaluate(() => hypeDisplay.set('theme', 'dark'));
			const darkHeader = await header();
			assert.ok(darkHeader, '--bg-header must be defined for the dark theme');
			assert.deepEqual(await meta(), [darkHeader]);
			await p.evaluate(() => hypeDisplay.set('theme', 'light'));
			assert.deepEqual(await meta(), ['#000000']);
		}));

		test('storage-blocked', () => withPage({ skin, storage: 'blocked', system: 'dark' }, async (p) => {
			assert.equal(await attr(p, 'data-theme'), 'dark');
			await p.evaluate(() => hypeDisplay.toggle('theme'));
			assert.equal(await attr(p, 'data-theme'), 'light');
			assert.deepEqual(p.errors.map(String), []);
		}));

		test('invalid-stored-value', () => withPage({ skin, system: 'light', raw: { 'hype-theme': 'blue', 'hype-font': 'huge' } }, async (p) => {
			assert.equal(await attr(p, 'data-theme'), 'light');
			assert.equal(await attr(p, 'data-font'), 'normal');
		}));
	});
}
