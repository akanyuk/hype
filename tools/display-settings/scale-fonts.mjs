// node scale-fonts.mjs <skinDir> [--write]
// Turns px font sizes and line heights into calc(Npx * var(--font-scale)).
// With --font-scale: 1 nothing changes; where it is 1.2 text grows. Which parts
// of the page scale is decided in theme.css by setting --font-scale per zone.
// The body rule stays literal: unscaled zones inherit their base size from it.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';

const skinDir = process.argv.slice(2).find((a) => !a.startsWith('--'));
const WRITE = process.argv.includes('--write');
if (!skinDir) { console.error('usage: node scale-fonts.mjs <skinDir> [--write]'); process.exit(2); }

const SKIP_FILES = new Set(['print.css', 'theme.css', 'display-settings.css', 'reset.css']);
const PX = /(?<![\w.-])(\d+(?:\.\d+)?)px\b/g;
const scale = (px) => `calc(${px}px * var(--font-scale))`;

async function cssFiles(dir) {
	const out = [];
	for (const e of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) out.push(...(await cssFiles(p)));
		else if (e.name.endsWith('.css') && !SKIP_FILES.has(e.name)) out.push(p);
	}
	return out.sort();
}

function convert(css) {
	let n = 0;
	const masked = [];
	let src = css.replace(/\/\*[\s\S]*?\*\/|url\([^)]*\)/g, (m) => `\u0000${masked.push(m) - 1}\u0000`);
	src = src.split('}').map((chunk) => {
		const i = chunk.lastIndexOf('{');
		if (i < 0) return chunk;
		const selector = chunk.slice(0, i).trim().split('\n').pop().trim();
		if (/^(html|body)$/i.test(selector)) return chunk;
		const body = chunk.slice(i + 1).replace(/(font-size|line-height|font)(\s*:\s*)([^;]+)/gi, (all, prop, sep, value) => {
			if (value.includes('--font-scale')) return all;
			let v = value;
			if (prop.toLowerCase() === 'font') {
				// "<size>[/<line-height>]" is the only px part of the shorthand
				v = value.replace(/(?<![\w.-])(\d+(?:\.\d+)?)px(?:\s*\/\s*(\d+(?:\.\d+)?)px)?/, (m, size, lh) => {
					n++;
					return scale(size) + (lh ? `/${scale(lh)}` : '');
				});
			} else {
				v = value.replace(PX, (m, px) => { n++; return scale(px); });
			}
			return prop + sep + v;
		});
		return chunk.slice(0, i + 1) + body;
	}).join('}');
	return { css: src.replace(/\u0000(\d+)\u0000/g, (_, k) => masked[+k]), n };
}

let total = 0;
for (const f of await cssFiles(join(skinDir, 'css'))) {
	const css = await readFile(f, 'utf8');
	const { css: out, n } = convert(css);
	total += n;
	if (n && WRITE) await writeFile(f, out);
}
console.log(`${basename(skinDir)}: ${total} values scaled${WRITE ? ' (written)' : ' (dry run)'}`);
