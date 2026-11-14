import puppeteer from 'puppeteer-core';

export const BASE = process.env.HYPE_BASE || 'http://hype.local';
export const LOGIN = process.env.HYPE_TEST_LOGIN || 'nyuk';
export const PASSWORD = process.env.HYPE_TEST_PASSWORD || 'test';

export const SKINS = ['desktop', 'mobile'];
export const ROLES = ['guest', 'user'];

// userOnly pages need an authorized visitor
export const PAGES = [
	{ id: 'index', path: '/' },
	{ id: 'topic', path: '/blog/dev/1092.html' },
	{ id: 'blogs', path: '/blogs/' },
	{ id: 'blog', path: '/blog/news/' },
	{ id: 'people', path: '/people/' },
	{ id: 'profile', path: `/profile/${LOGIN}/` },
	{ id: 'wall', path: `/profile/${LOGIN}/wall/` },
	{ id: 'stream', path: '/stream/' },
	{ id: 'search', path: '/search/topics/?q=zx' },
	{ id: 'talk', path: '/talk/', userOnly: true },
	{ id: 'settings', path: '/settings/profile/', userOnly: true },
	{ id: 'topic-add', path: '/topic/add/', userOnly: true },
];

export const pagesFor = (role) => PAGES.filter((p) => role === 'user' || !p.userOnly);

const UA = {
	desktop: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
	mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
};
const VIEWPORT = {
	desktop: { width: 1366, height: 900 },
	mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
};

// Elements whose content changes between loads (random logo, banners, radio)
export const VOLATILE_CSS = `
	.site-name img, .site-name a, #header .site-name *, .banner, [class*="banner"], [id*="banner"],
	.hyperadio, [id*="hyperadio"], [class*="hyperadio"] { visibility: hidden !important; }
	*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
`;

export function launch() {
	return puppeteer.launch({
		executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
		headless: true,
		args: ['--no-sandbox', '--font-render-hinting=none', '--hide-scrollbars'],
	});
}

const sessions = new Map();

async function login(browser, skin) {
	if (sessions.has(skin)) return sessions.get(skin);
	const ctx = await browser.createBrowserContext();
	const page = await ctx.newPage();
	await page.setUserAgent(UA[skin]);
	await page.goto(`${BASE}/login/`, { waitUntil: 'networkidle2' });
	// Same request the login form sends via ls.user.login()
	const res = await page.evaluate(async (l, p) => {
		const body = new URLSearchParams({ login: l, password: p, remember: 'on', security_ls_key: LIVESTREET_SECURITY_KEY });
		const r = await fetch(`${aRouter.login}ajax-login/`, { method: 'POST', body, credentials: 'same-origin' });
		return r.json();
	}, LOGIN, PASSWORD);
	if (res.bStateError) throw new Error(`login failed: ${res.sMsg}`);
	await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
	const ok = await page.evaluate(() => !!document.querySelector('#dropdown-user, .userbar-menu-user'));
	const cookies = await ctx.cookies(BASE);
	await ctx.close();
	if (!ok) throw new Error('login failed: no user menu after login');
	sessions.set(skin, cookies);
	return cookies;
}

/**
 * Opens a page in a fresh context.
 * theme/font: values put into localStorage before load (undefined = no stored choice).
 * storage: 'blocked' makes localStorage throw SecurityError.
 * system: 'light'|'dark' emulated prefers-color-scheme (default light).
 * raw: stored values written verbatim (for invalid-value tests): { 'hype-theme': 'blue' }.
 */
export async function openPage(browser, { skin = 'desktop', role = 'guest', theme, font, path = '/', storage, system = 'light', raw, volatile = true, context } = {}) {
	const ctx = context || (await browser.createBrowserContext());
	const page = await ctx.newPage();
	page.errors = [];
	page.on('pageerror', (e) => page.errors.push(e));
	await page.setUserAgent(UA[skin]);
	await page.setViewport(VIEWPORT[skin]);
	await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }]);
	if (role === 'user') await ctx.setCookie(...(await login(browser, skin)));
	const stored = { ...(raw || {}) };
	if (theme) stored['hype-theme'] = theme;
	if (font) stored['hype-font'] = font;
	await page.evaluateOnNewDocument((stored, blocked) => {
		if (blocked) {
			Object.defineProperty(window, 'localStorage', {
				configurable: true,
				get() { throw new DOMException('blocked', 'SecurityError'); },
			});
			return;
		}
		if (sessionStorage.getItem('__seeded')) return;
		sessionStorage.setItem('__seeded', '1');
		for (const [k, v] of Object.entries(stored)) localStorage.setItem(k, v);
	}, stored, storage === 'blocked');
	await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 30000 });
	await page.evaluate(() => Promise.race([
		Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))]),
		new Promise((r) => setTimeout(r, 10000)),
	]));
	if (volatile) {
		await page.addStyleTag({ content: VOLATILE_CSS });
		// View counters grow on every load; "last visit" moves with each test login
		await page.evaluate(() => {
			document.querySelectorAll('.topic-info-views, .topic-info-date').forEach((e) => { e.style.visibility = 'hidden'; });
			document.querySelectorAll('.profile-dotted-list li, table tr').forEach((e) => {
				if (/Последний визит|Last visit/i.test(e.textContent)) e.style.visibility = 'hidden';
			});
		});
	}
	page.context = ctx;
	return page;
}
