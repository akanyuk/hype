// node diff.mjs <labelA> <labelB> — per-file share of differing pixels; exit 1 if any differ
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [a, b] = process.argv.slice(2);
if (!a || !b) { console.error('usage: node diff.mjs <labelA> <labelB>'); process.exit(2); }
const shots = new URL('./shots/', import.meta.url).pathname;
const out = `${shots}diff-${a}-${b}/`;
await mkdir(out, { recursive: true });

// Pads the smaller image with magenta so height changes count as differences
function pad(img, w, h) {
	if (img.width === w && img.height === h) return img;
	const p = new PNG({ width: w, height: h });
	for (let i = 0; i < p.data.length; i += 4) p.data.set([255, 0, 255, 255], i);
	PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0);
	return p;
}

let failed = 0;
for (const f of (await readdir(`${shots}${b}`)).filter((f) => f.endsWith('.png')).sort()) {
	if (!existsSync(`${shots}${a}/${f}`)) { console.log(`${f}: missing in ${a}`); failed++; continue; }
	let ia = PNG.sync.read(await readFile(`${shots}${a}/${f}`));
	let ib = PNG.sync.read(await readFile(`${shots}${b}/${f}`));
	const w = Math.max(ia.width, ib.width), h = Math.max(ia.height, ib.height);
	ia = pad(ia, w, h); ib = pad(ib, w, h);
	const d = new PNG({ width: w, height: h });
	const px = pixelmatch(ia.data, ib.data, d.data, w, h, { threshold: 0.05 });
	const pct = (px / (w * h)) * 100;
	const size = ia.height !== ib.height ? ` (height ${ia.height}→${ib.height})` : '';
	console.log(`${f}: ${pct.toFixed(2)}%${size}`);
	if (px > 0) { failed++; await writeFile(`${out}${f}`, PNG.sync.write(d)); }
}
console.log(failed ? `${failed} file(s) differ; diffs in ${out}` : 'identical');
process.exit(failed ? 1 : 0);
