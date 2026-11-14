// node shoot.mjs <label> [--skin desktop|mobile] [--role guest|user] [--theme light|dark] [--font normal|large] [--only <pageId>] [--dynamic]
import { mkdir } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { launch, openPage, pagesFor, SKINS, ROLES } from './matrix.mjs';

const { values: o, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		skin: { type: 'string' }, role: { type: 'string' }, theme: { type: 'string' },
		font: { type: 'string' }, only: { type: 'string' }, dynamic: { type: 'boolean' },
	},
});
const label = positionals[0];
if (!label) { console.error('usage: node shoot.mjs <label> [options]'); process.exit(2); }
const dir = new URL(`./shots/${label}/`, import.meta.url).pathname;
await mkdir(dir, { recursive: true });

// Opens transient UI (modals, menus, notifier, editor) to catch unstyled dynamic parts
async function dynamic(page, pageId, role) {
	await page.evaluate((pageId, role) => {
		const $ = window.jQuery;
		if (!$) return;
		if (window.ls && ls.msg) ls.msg.notice('Тест', 'Проверка уведомления');
		if (role === 'user') $('#dropdown-user-menu').show();
		if (pageId === 'topic') {
			if (role === 'guest') $('.js-login-form-show').first().trigger('click');
			$('#update-comments').trigger('click');
		}
		if (pageId === 'topic-add') {
			$('#topic_text').trigger('focus');
			$('#topic_tags').val('z').trigger('keydown').trigger('input');
		}
	}, pageId, role);
	await new Promise((r) => setTimeout(r, 800));
}

const browser = await launch();
let n = 0;
try {
	for (const skin of o.skin ? [o.skin] : SKINS) {
		for (const role of o.role ? [o.role] : ROLES) {
			for (const p of pagesFor(role)) {
				if (o.only && o.only !== p.id) continue;
				const page = await openPage(browser, { skin, role, theme: o.theme, font: o.font, path: p.path });
				await page.screenshot({ path: `${dir}${skin}-${role}-${p.id}.png`, fullPage: true });
				n++;
				if (o.dynamic) {
					await dynamic(page, p.id, role);
					await page.screenshot({ path: `${dir}${skin}-${role}-${p.id}-dyn.png`, fullPage: true });
					n++;
				}
				await page.context.close();
			}
		}
	}
} finally {
	await browser.close();
}
console.log(`${n} screenshots → ${dir}`);
