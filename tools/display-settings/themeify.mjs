// node themeify.mjs <skinDir> [--write] [--dark]
// Replaces color literals in a skin's CSS with tokens and writes the token
// blocks into css/theme.css between marker comments.
//   token name: --{kind}-{family}-{L*}[-a{alpha}][-{n}]  (kind: text|bg|border|shadow)
//   light value: the exact original literal, so the light theme does not change
//   dark value (--dark): derived by darkTransform(), see lib/color.mjs
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { parseColor, toLab, family, formatColor, darkTransform } from './lib/color.mjs';
import { launch } from './matrix.mjs';

const args = process.argv.slice(2);
const skinDir = args.find((a) => !a.startsWith('--'));
const WRITE = args.includes('--write');
const DARK = args.includes('--dark');
if (!skinDir) { console.error('usage: node themeify.mjs <skinDir> [--write] [--dark]'); process.exit(2); }

const SKIP_FILES = new Set(['print.css', 'hype-hl.css', 'theme.css', 'reset.css']);
// IE-only or non-color properties that must stay literal
const SKIP_PROPS = /^(-ms-filter|filter|scrollbar-.*|dlight-color|zoom)$/i;
const COLOR = /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|rgba?\([^)]*\)|\b(?:white|black|red)\b/gi;

function kindOf(prop, value) {
	const p = prop.toLowerCase();
	if (p === 'color') return 'text';
	if (p.startsWith('background') || /gradient/i.test(value)) return 'bg';
	if (p.startsWith('border') || p.startsWith('outline')) return 'border';
	if (p.includes('shadow')) return 'shadow';
	return 'misc';
}

async function cssFiles(dir) {
	const out = [];
	for (const e of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) out.push(...(await cssFiles(p)));
		else if (e.name.endsWith('.css') && !SKIP_FILES.has(e.name)) out.push(p);
	}
	return out.sort();
}

const tokens = new Map(); // name -> { light: literal, rgba, kind }
const byKey = new Map(); // kind|normalized -> name

function tokenFor(kind, literal) {
	const rgba = parseColor(literal);
	const norm = formatColor(rgba);
	const key = `${kind}|${norm}`;
	if (byKey.has(key)) return byKey.get(key);
	const L = Math.round(toLab(rgba).L);
	let base = `--${kind}-${family(rgba)}-${L}${rgba.a < 1 ? `-a${Math.round(rgba.a * 100)}` : ''}`;
	let name = base;
	for (let n = 2; tokens.has(name); n++) name = `${base}-${n}`;
	tokens.set(name, { light: norm, rgba, kind });
	byKey.set(key, name);
	return name;
}

// Visits declarations: text after the last "{" of each "}"-terminated chunk, comments masked
function eachDeclaration(css, fn) {
	const masked = [];
	let src = css.replace(/\/\*[\s\S]*?\*\/|url\([^)]*\)/g, (m) => `\u0000${masked.push(m) - 1}\u0000`);
	const unmask = (s) => s.replace(/\u0000(\d+)\u0000/g, (_, n) => masked[+n]);
	src = src.split('}').map((chunk) => {
		const i = chunk.lastIndexOf('{');
		if (i < 0) return chunk;
		const body = chunk.slice(i + 1).replace(/([a-z-]+)(\s*:\s*)([^;]+)/gi, (all, prop, sep, value) => {
			const v = fn(prop, value, unmask(value));
			return v === undefined ? all : prop + sep + v;
		});
		return chunk.slice(0, i + 1) + body;
	}).join('}');
	return unmask(src);
}

const candidate = (prop, value) => !SKIP_PROPS.test(prop) && !value.includes('var(--') && new RegExp(COLOR.source, 'i').test(value);
const supportsKey = (prop, real) => `${prop}\u0001${real.replace(/!important/i, '').trim()}`;

// Declarations the browser rejects at parse time (legacy prefixes, old gradient syntax)
// must stay literal: with var() they pass parsing and void the earlier valid declaration
async function rejected(pairs) {
	const browser = await launch();
	try {
		const page = await browser.newPage();
		const bad = await page.evaluate((keys) => keys.filter((k) => { const [p, v] = k.split('\u0001'); return !CSS.supports(p, v); }), [...pairs]);
		return new Set(bad);
	} finally {
		await browser.close();
	}
}

function rewrite(css, stats, bad) {
	return eachDeclaration(css, (prop, value, real) => {
		if (!candidate(prop, value) || bad.has(supportsKey(prop, real))) return undefined;
		const kind = kindOf(prop, value);
		return value.replace(COLOR, (lit) => {
			if (kind === 'misc') { stats.misc.push(`${prop}: ${lit}`); return lit; }
			stats.replaced++;
			return `var(${tokenFor(kind, lit)})`;
		});
	});
}

function block(selector, entries) {
	return `${selector} {\n${entries.map(([n, v]) => `\t${n}: ${v};`).join('\n')}\n}`;
}

const stats = { replaced: 0, misc: [] };
const themePath = join(skinDir, 'css', 'theme.css');
const theme = await readFile(themePath, 'utf8');

// Reuse tokens already defined in theme.css so reruns are stable
for (const m of theme.matchAll(/\t(--(?:text|bg|border|shadow)-(?:gray|black|red|orange|yellow|green|cyan|blue|purple)-[a-z0-9-]+): ([^;]+);/g)) {
	if (tokens.has(m[1])) continue;
	const rgba = parseColor(m[2]);
	const kind = m[1].split('-')[2];
	tokens.set(m[1], { light: m[2], rgba, kind });
	byKey.set(`${kind}|${formatColor(rgba)}`, m[1]);
}

const files = await cssFiles(join(skinDir, 'css'));
const sources = new Map();
const pairs = new Set();
for (const f of files) {
	const css = await readFile(f, 'utf8');
	sources.set(f, css);
	eachDeclaration(css, (prop, value, real) => { if (candidate(prop, value)) pairs.add(supportsKey(prop, real)); });
}
const bad = await rejected(pairs);
for (const f of files) {
	const css = sources.get(f);
	const out = rewrite(css, stats, bad);
	if (out !== css && WRITE) await writeFile(f, out);
}
stats.rejected = bad.size;

const sorted = [...tokens.entries()].sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }));
const light = block(':root', sorted.map(([n, t]) => [n, t.light]));
const dark = block('html[data-theme="dark"]', sorted.map(([n, t]) => [n, formatColor(darkTransform(t.kind, t.rgba))]));
const START = '/* tokens:start — generated by tools/display-settings/themeify.mjs, edit values by hand if needed */';
const END = '/* tokens:end */';
const DSTART = '/* dark-tokens:start */';
const DEND = '/* dark-tokens:end */';

const replaceBetween = (text, s, e, content) => {
	const re = new RegExp(`${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
	return re.test(text) ? text.replace(re, `${s}\n${content}\n${e}`) : `${text.trimEnd()}\n\n${s}\n${content}\n${e}\n`;
};

let next = replaceBetween(theme, START, END, light);
if (DARK) next = replaceBetween(next, DSTART, DEND, dark);
if (WRITE) await writeFile(themePath, next);

console.log(`${basename(skinDir)}: ${stats.replaced} literals → ${tokens.size} tokens, ${stats.rejected} rejected declarations left literal${WRITE ? ' (written)' : ' (dry run)'}`);
if (stats.misc.length) console.log('left literal (misc props):', [...new Set(stats.misc)].join('; '));
