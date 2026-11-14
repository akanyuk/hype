// node contrast.mjs <skin> <role> <pageId|all> [--theme dark] [--font large]
// Checks text contrast against the effective background:
//   main text (topic/comment bodies) must reach 4.5:1, any other text 3:1.
// Text over background images is skipped (its background is unknown).
import { parseArgs } from 'node:util';
import { launch, openPage, pagesFor } from './matrix.mjs';
import { parseColor, contrast } from './lib/color.mjs';

const { values: o, positionals } = parseArgs({ allowPositionals: true, options: { theme: { type: 'string' }, font: { type: 'string' } } });
const [skin, role, pageId] = positionals;
if (!skin || !role || !pageId) { console.error('usage: node contrast.mjs <skin> <role> <pageId|all> [--theme dark]'); process.exit(2); }

const MAIN = '.topic-content, .comment-content, .text';

const browser = await launch();
let failures = 0;
try {
	for (const p of pagesFor(role).filter((p) => pageId === 'all' || p.id === pageId)) {
		const page = await openPage(browser, { skin, role, path: p.path, theme: o.theme, font: o.font });
		const samples = await page.evaluate((MAIN) => {
			const out = [];
			const opaque = (c) => c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c);
			const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
			const seen = new Set();
			for (let n = walker.nextNode(); n; n = walker.nextNode()) {
				if (!n.textContent.trim()) continue;
				const el = n.parentElement;
				if (!el || seen.has(el)) continue;
				seen.add(el);
				const s = getComputedStyle(el);
				const r = el.getBoundingClientRect();
				if (s.visibility !== 'visible' || +s.opacity === 0 || r.width === 0 || r.height === 0) continue;
				if (el.closest('script, style, noscript, [aria-hidden="true"]')) continue;
				let bg = null, image = false;
				for (let e = el; e; e = e.parentElement) {
					const es = getComputedStyle(e);
					if (es.backgroundImage !== 'none' && !es.backgroundImage.startsWith('linear-gradient')) { image = true; break; }
					if (opaque(es.backgroundColor)) { bg = es.backgroundColor; break; }
				}
				if (image) continue;
				const size = parseFloat(s.fontSize);
				const large = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700);
				out.push({
					text: n.textContent.trim().slice(0, 40),
					sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''),
					color: s.color,
					bg: bg || getComputedStyle(document.documentElement).backgroundColor || 'rgb(255, 255, 255)',
					main: !!el.closest(MAIN),
					large,
				});
			}
			return out;
		}, MAIN);
		await page.context.close();
		const bad = [];
		for (const x of samples) {
			const fg = parseColor(x.color), bg = parseColor(opaqueOr(x.bg));
			// Blend semi-transparent text over its background
			const c = contrast(blend(fg, bg), bg);
			const min = x.main && !x.large ? 4.5 : 3;
			if (c < min) bad.push(`  ${c.toFixed(2)} < ${min}  ${x.sel}  ${x.color} on ${x.bg}  «${x.text}»`);
		}
		const uniq = [...new Set(bad)];
		console.log(`${skin} ${role} ${p.id}: ${samples.length} texts, ${uniq.length} below threshold`);
		if (uniq.length) console.log(uniq.slice(0, 30).join('\n'));
		failures += uniq.length;
	}
} finally {
	await browser.close();
}
process.exit(failures ? 1 : 0);

function opaqueOr(c) { return c === 'transparent' ? 'rgb(255, 255, 255)' : c; }
function blend(fg, bg) {
	const a = fg.a ?? 1;
	return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}
