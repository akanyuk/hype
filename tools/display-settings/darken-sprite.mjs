// node darken-sprite.mjs <in.png> <out.png> [--threshold-l 45] [--threshold-s 0.25] [--target-l 88]
// Makes a dark-theme copy of a sprite: dark, low-saturation pixels (gray glyphs)
// get their lightness mirrored towards --target-l; colored pixels, alpha and
// geometry stay the same, so CSS background positions keep working. Glyphs on
// baked light plates (buttons, checkboxes) are left alone.
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { PNG } from 'pngjs';
import { toLab, fromLab } from './lib/color.mjs';

const { values: o, positionals } = parseArgs({
	allowPositionals: true,
	options: { 'threshold-l': { type: 'string', default: '45' }, 'threshold-s': { type: 'string', default: '0.25' }, 'target-l': { type: 'string', default: '88' } },
});
const [input, output] = positionals;
if (!input || !output) { console.error('usage: node darken-sprite.mjs <in.png> <out.png> [options]'); process.exit(2); }
const maxL = +o['threshold-l'], maxS = +o['threshold-s'], target = +o['target-l'];

const png = PNG.sync.read(await readFile(input));
const src = Buffer.from(png.data);

// A glyph drawn on an opaque light plate (button, checkbox) is already readable
function onLightPlate(x, y) {
	for (let dy = -3; dy <= 3; dy++) {
		for (let dx = -3; dx <= 3; dx++) {
			const nx = x + dx, ny = y + dy;
			if (nx < 0 || ny < 0 || nx >= png.width || ny >= png.height) continue;
			const j = (ny * png.width + nx) * 4;
			if (src[j + 3] > 200 && toLab({ r: src[j], g: src[j + 1], b: src[j + 2] }).L > 85) return true;
		}
	}
	return false;
}

let changed = 0;
for (let i = 0; i < png.data.length; i += 4) {
	const a = png.data[i + 3];
	if (a === 0) continue;
	const c = { r: src[i], g: src[i + 1], b: src[i + 2] };
	const max = Math.max(c.r, c.g, c.b), min = Math.min(c.r, c.g, c.b);
	const saturation = max === 0 ? 0 : (max - min) / max;
	const lab = toLab(c);
	if (lab.L >= maxL || saturation >= maxS || onLightPlate((i / 4) % png.width, Math.floor(i / 4 / png.width))) continue;
	const out = fromLab({ L: target - lab.L * (target - maxL) / maxL, a: lab.a, b: lab.b });
	png.data[i] = Math.round(out.r);
	png.data[i + 1] = Math.round(out.g);
	png.data[i + 2] = Math.round(out.b);
	changed++;
}
await writeFile(output, PNG.sync.write(png));
console.log(`${output}: ${changed} pixels lightened`);
