import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { toLab } from '../lib/color.mjs';

const TOOL = new URL('../darken-sprite.mjs', import.meta.url).pathname;

test('lightens dark neutral pixels, keeps colored ones and alpha', async () => {
	const dir = await mkdtemp(join(tmpdir(), 'sprite-'));
	const src = new PNG({ width: 3, height: 1 });
	src.data.set([0, 0, 0, 255, 238, 0, 0, 255, 80, 80, 80, 128]);
	await writeFile(join(dir, 'in.png'), PNG.sync.write(src));
	execFileSync('node', [TOOL, join(dir, 'in.png'), join(dir, 'out.png')]);
	const out = PNG.sync.read(await readFile(join(dir, 'out.png')));
	assert.equal(out.width, 3);
	assert.equal(out.height, 1);
	const px = (i) => ({ r: out.data[i * 4], g: out.data[i * 4 + 1], b: out.data[i * 4 + 2], a: out.data[i * 4 + 3] });
	assert.ok(toLab(px(0)).L > 70, `black became ${JSON.stringify(px(0))}`);
	assert.deepEqual(px(1), { r: 238, g: 0, b: 0, a: 255 });
	assert.equal(px(2).a, 128);
	assert.ok(toLab(px(2)).L > 50);
});

test('glyphs drawn on a baked light plate stay dark', async () => {
	const dir = await mkdtemp(join(tmpdir(), 'sprite-'));
	// 5x7 opaque white plate with a black pixel, plus a lone black pixel on transparency
	const src = new PNG({ width: 10, height: 7 });
	for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) src.data.set([255, 255, 255, 255], (y * 10 + x) * 4);
	src.data.set([0, 0, 0, 255], (3 * 10 + 2) * 4);
	src.data.set([0, 0, 0, 255], (3 * 10 + 9) * 4);
	await writeFile(join(dir, 'in.png'), PNG.sync.write(src));
	execFileSync('node', [TOOL, join(dir, 'in.png'), join(dir, 'out.png')]);
	const out = PNG.sync.read(await readFile(join(dir, 'out.png')));
	const at = (x, y) => [...out.data.slice((y * 10 + x) * 4, (y * 10 + x) * 4 + 4)];
	assert.deepEqual(at(2, 3), [0, 0, 0, 255]);
	assert.ok(toLab({ r: at(9, 3)[0], g: at(9, 3)[1], b: at(9, 3)[2] }).L > 70);
});
