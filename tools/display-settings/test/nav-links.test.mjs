// Main menu: "People" opens the online list, "Activity" opens the whole stream
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { launch, openPage, BASE } from '../matrix.mjs';

let browser;
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); });

const MENU = { desktop: '#nav-main', mobile: '#userbar .userbar-menu-items' };

for (const skin of ['desktop', 'mobile']) {
	test(`${skin} menu links to people online and the whole stream`, async () => {
		const p = await openPage(browser, { skin, path: '/', volatile: false });
		const hrefs = await p.$$eval(`${MENU[skin]} a`, (as) => as.map((a) => a.href));
		await p.context.close();
		const people = hrefs.filter((h) => h.startsWith(`${BASE}/people/`));
		const stream = hrefs.filter((h) => h.startsWith(`${BASE}/stream/`));
		assert.deepEqual(people, [`${BASE}/people/online/`]);
		assert.deepEqual(stream, [`${BASE}/stream/all/`]);
	});
}
