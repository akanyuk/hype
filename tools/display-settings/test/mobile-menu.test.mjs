import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage } from '../matrix.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

async function withPage(opts, fn) {
	const page = await openPage(browser, { skin: 'mobile', path: '/', volatile: false, ...opts });
	try { await fn(page); } finally { await page.context.close(); }
}

const ITEMS = [
	{ item: '.userbar-item-live', panel: '#stream-block' },
	{ item: '.userbar-item-news', panel: '#news-block' },
	{ item: '.userbar-item-search', panel: '#search' },
];

for (const role of ['guest', 'user']) {
	describe(role, () => {
		test('index-menu-without-discussed', () => withPage({ role }, async (p) => {
			const links = await p.$$eval('#nav .nav-pills a', (as) => as.map((a) => a.getAttribute('href')));
			assert.ok(links.length > 0, 'index menu is present');
			assert.deepEqual(links.filter((h) => h.includes('/discussed')), []);
		}));

		test('header-icons-moved', () => withPage({ role }, async (p) => {
			const found = await p.evaluate(() => ['.icon-stream-lg', '.icon-news-lg', '#item-search']
				.filter((s) => document.querySelector(`#header ${s}`)));
			assert.deepEqual(found, []);
		}));

		test('menu-items-present', () => withPage({ role }, async (p) => {
			const r = await p.evaluate(() => {
				const list = document.querySelector('#userbar .userbar-menu-items');
				const first = [...list.children].slice(0, 3).map((li) => li.className.split(' ').find((c) => c.startsWith('userbar-item-')));
				const counts = ['live', 'news', 'search'].map((n) => document.querySelectorAll(`#userbar .userbar-item-${n}`).length);
				const newsBlogLink = [...document.querySelectorAll('#userbar a')].some((a) => /\/blog\/news\/?$/.test(a.getAttribute('href') || ''));
				return { first, counts, newsBlogLink };
			});
			assert.deepEqual(r.first, ['userbar-item-live', 'userbar-item-news', 'userbar-item-search']);
			assert.deepEqual(r.counts, [1, 1, 1]);
			assert.equal(r.newsBlogLink, false);
		}));

		for (const { item, panel } of ITEMS) {
			test(`menu-opens-panel ${item}`, () => withPage({ role }, async (p) => {
				await p.click('#userbar-trigger');
				await new Promise((r) => setTimeout(r, 400));
				await p.click(`#userbar ${item} a`);
				await new Promise((r) => setTimeout(r, 800));
				const r = await p.evaluate((panel) => ({
					visible: getComputedStyle(document.querySelector(panel)).display !== 'none',
					menuLeft: parseInt(getComputedStyle(document.querySelector('#userbar')).left, 10),
					others: [...document.querySelectorAll('.slide')].filter((e) => !e.matches(panel) && getComputedStyle(e).display !== 'none').length,
				}), panel);
				assert.equal(r.visible, true, `${panel} should be visible`);
				assert.ok(r.menuLeft < 0, 'side menu should be closed');
				assert.equal(r.others, 0);
			}));
		}

		test('unread-highlight', () => withPage({ role }, async (p) => {
			const r = await p.evaluate(() => ({
				stream: !!document.querySelector('#unread-stream'),
				news: !!document.querySelector('#unread-news'),
				live: document.querySelector('.userbar-item-live').classList.contains('unread'),
				newsItem: document.querySelector('.userbar-item-news').classList.contains('unread'),
				trigger: document.querySelector('#userbar-trigger').classList.contains('unread'),
			}));
			assert.equal(r.live, r.stream);
			assert.equal(r.newsItem, r.news);
			assert.equal(r.trigger, r.stream || r.news);
		}));

		// Unread markers are orange (#ff8c1a): dot on the menu button and on the items, item text;
		// the live icon keeps the regular item color
		for (const theme of ['light', 'dark']) test(`unread-orange ${theme}`, () => withPage({ role, theme }, async (p) => {
			const r = await p.evaluate(() => {
				const live = document.querySelector('.userbar-item-live');
				const news = document.querySelector('.userbar-item-news');
				const trigger = document.querySelector('#userbar-trigger');
				const plainIcon = getComputedStyle(live.querySelector('.menu-icon-svg')).color;
				[live, news, trigger].forEach((e) => e.classList.add('unread'));
				const cs = (e, pseudo) => getComputedStyle(e, pseudo);
				return {
					triggerDot: cs(trigger, '::after').backgroundColor,
					liveDot: cs(live.querySelector('a'), '::after').backgroundColor,
					newsDot: cs(news.querySelector('a'), '::after').backgroundColor,
					liveText: cs(live.querySelector('a')).color,
					newsText: cs(news.querySelector('a')).color,
					liveIcon: cs(live.querySelector('.menu-icon-svg')).color,
					plainIcon,
					regular: cs(document.querySelector('#userbar .userbar-menu-items li:not(.unread) a')).color,
				};
			});
			const ORANGE = 'rgb(255, 140, 26)';
			assert.deepEqual(
				[r.triggerDot, r.liveDot, r.newsDot, r.liveText, r.newsText],
				[ORANGE, ORANGE, ORANGE, ORANGE, ORANGE]);
			assert.equal(r.liveIcon, r.plainIcon);
			assert.equal(r.liveIcon, r.regular);
		}));

		test('unread-highlight synthetic news', async () => {
			// Inject an unread marker before jQuery ready handlers run
			const p = await openPage(browser, {
				skin: 'mobile', role, path: '/', volatile: false,
				beforeLoad: (page) => page.evaluateOnNewDocument(() => {
					document.addEventListener('DOMContentLoaded', () => {
						document.querySelectorAll('#unread-news, #unread-stream').forEach((e) => e.removeAttribute('id'));
						const s = document.createElement('span');
						s.id = 'unread-news';
						document.body.appendChild(s);
					}, { capture: true, once: true });
				}),
			});
			const r = await p.evaluate(() => ({
				news: document.querySelector('.userbar-item-news').classList.contains('unread'),
				live: document.querySelector('.userbar-item-live').classList.contains('unread'),
				trigger: document.querySelector('#userbar-trigger').classList.contains('unread'),
			}));
			await p.context.close();
			assert.deepEqual(r, { news: true, live: false, trigger: true });
		});
	});
}
