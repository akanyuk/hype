// Link previews (Open Graph) as Telegram sees them: plain HTML, no JS
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.HYPE_BASE || 'http://hype.local';
const LOGO = `${BASE}/favicon/image_src.png`;
const UA = {
	desktop: 'TelegramBot (like TwitterBot)',
	mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
};

const decode = (s) => s
	.replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
	.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&');

// All meta tags with property/name and content, in document order
async function load(skin, path, headers = {}) {
	const res = await fetch(BASE + path, { headers: { 'User-Agent': UA[skin], ...headers }, redirect: 'follow' });
	assert.equal(res.status, 200, `${path} status`);
	const html = await res.text();
	const head = html.slice(0, html.indexOf('</head>'));
	const metas = [...head.matchAll(/<meta\s+(?:property|name)="((?:og|twitter):[^"]+)"\s+content="([^"]*)"\s*\/?>/g)]
		.map(([, key, value]) => [key, decode(value)]);
	const og = Object.fromEntries(metas);
	const title = decode((head.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
	const description = decode((head.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
	return { html, metas, og, title, description, skin };
}

const count = (page, key) => page.metas.filter(([k]) => k === key).length;

function common(page, { type, url }) {
	for (const key of ['og:site_name', 'og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:locale', 'twitter:card']) {
		assert.equal(count(page, key), 1, `${page.skin}: one ${key}`);
	}
	assert.equal(page.og['og:site_name'], 'HYPE');
	assert.equal(page.og['og:type'], type);
	assert.equal(page.og['og:url'], url);
	assert.equal(page.og['og:locale'], 'ru_RU');
	assert.match(page.og['og:image'], /^https?:\/\//, 'absolute image URL');
	for (const key of ['og:url', 'og:image']) assert.doesNotMatch(page.og[key].replace(/^https?:\/\//, ''), /\/\//, `${key} without double slashes`);
	assert.ok(page.og['og:title'].length > 0, 'title');
	assert.ok(page.og['og:description'].length > 0, 'description');
	assert.doesNotMatch(page.og['og:description'], /<|&[a-z]+;/, 'description is plain text');
}

const withLogo = (page) => {
	assert.equal(page.og['og:image'], LOGO);
	assert.equal(page.og['twitter:card'], 'summary');
};

for (const skin of ['desktop', 'mobile']) {
	describe(skin, () => {
		test('topic with an image in the text', async () => {
			const p = await load(skin, '/blog/dev/1128.html');
			common(p, { type: 'article', url: `${BASE}/blog/dev/1128.html` });
			assert.equal(p.og['og:title'], p.title.split(' / ')[0]);
			assert.match(p.og['og:description'], /^Автор: aGGreSSor\. \S/);
			assert.ok(p.og['og:description'].length <= 220, `description length ${p.og['og:description'].length}`);
			assert.equal(p.og['og:image'], 'https://hype.retroscene.org/uploads/images/00/01/67/2026/06/12/291fdd.png');
			assert.equal(p.og['twitter:card'], 'summary_large_image');
		});

		test('topic without images', async () => {
			const p = await load(skin, '/blog/misc/1109.html');
			common(p, { type: 'article', url: `${BASE}/blog/misc/1109.html` });
			assert.equal(p.og['og:title'], 'Commander X16');
			assert.match(p.og['og:description'], /^Автор: frog\. \S/);
			withLogo(p);
		});

		test('long description is cut on a word boundary', async () => {
			const p = await load(skin, '/blog/misc/1109.html');
			const d = p.og['og:description'];
			if (d.endsWith('…')) assert.match(d, /\S…$/, 'no space before the ellipsis');
		});

		test('topic title with quotes is escaped', async () => {
			const p = await load(skin, '/blog/misc/20.html');
			assert.ok(p.og['og:title'].startsWith('"Making of Paralactika":'), p.og['og:title']);
		});

		test('photoset topic uses its main photo', async () => {
			const p = await load(skin, '/blog/fiori/896.html');
			common(p, { type: 'article', url: `${BASE}/blog/fiori/896.html` });
			assert.match(p.og['og:image'], /\/uploads\/.+\.(jpe?g|png|gif)$/i);
			assert.equal(p.og['twitter:card'], 'summary_large_image');
		});

		test('own URLs follow https of the request', async () => {
			const p = await load(skin, '/blog/misc/1109.html', { 'X-Forwarded-Proto': 'https' });
			const host = BASE.replace(/^https?:\/\//, '');
			assert.equal(p.og['og:url'], `https://${host}/blog/misc/1109.html`);
			assert.equal(p.og['og:image'], `https://${host}/favicon/image_src.png`);
		});

		test('user with full name and photo', async () => {
			const p = await load(skin, '/profile/nyuk/');
			common(p, { type: 'profile', url: `${BASE}/profile/nyuk/` });
			assert.equal(p.og['og:title'], 'aka.nyuk (nyuk)');
			assert.equal(p.og['og:description'], 'Профиль пользователя nyuk на HYPE');
			assert.equal(p.og['og:image'], 'https://hype.retroscene.org/uploads/images/00/00/02/2016/10/12/1e4e65.png');
			assert.equal(p.og['twitter:card'], 'summary_large_image');
		});

		test('user without name and photo', async () => {
			const p = await load(skin, '/profile/trefi/');
			common(p, { type: 'profile', url: `${BASE}/profile/trefi/` });
			assert.equal(p.og['og:title'], 'trefi');
			assert.equal(p.og['og:description'], 'Профиль пользователя trefi на HYPE');
			withLogo(p);
		});

		test('blog with avatar and description', async () => {
			const p = await load(skin, '/blog/dev/');
			common(p, { type: 'website', url: `${BASE}/blog/dev/` });
			assert.equal(p.og['og:title'], 'Development');
			assert.notEqual(p.og['og:description'], 'Блог на HYPE');
			assert.equal(p.og['og:image'], 'https://hype.retroscene.org/uploads/images/00/00/14/2015/01/22/avatar_blog_dev.png');
			assert.equal(p.og['twitter:card'], 'summary_large_image');
		});

		test('blog without avatar', async () => {
			const p = await load(skin, '/blog/events/');
			common(p, { type: 'website', url: `${BASE}/blog/events/` });
			withLogo(p);
		});

		test('other pages use the site defaults', async () => {
			const p = await load(skin, '/');
			common(p, { type: 'website', url: `${BASE}/` });
			assert.equal(p.og['og:title'], p.title);
			assert.equal(p.og['og:description'], p.description);
			withLogo(p);
		});
	});
}
