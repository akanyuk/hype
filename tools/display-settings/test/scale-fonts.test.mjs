import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const TOOL = new URL('../scale-fonts.mjs', import.meta.url).pathname;

async function convert(files) {
	const dir = await mkdtemp(join(tmpdir(), 'scale-'));
	await mkdir(join(dir, 'css'));
	for (const [name, css] of Object.entries(files)) await writeFile(join(dir, 'css', name), css);
	execFileSync('node', [TOOL, dir, '--write']);
	execFileSync('node', [TOOL, dir, '--write']); // rerun must be a no-op
	return (name) => readFile(join(dir, 'css', name), 'utf8');
}

test('scales px font sizes and line heights', async () => {
	const read = await convert({ 'a.css': '.a { font-size: 12px; line-height: 18px; margin: 4px; }\n' });
	assert.equal(await read('a.css'), '.a { font-size: calc(12px * var(--font-scale)); line-height: calc(18px * var(--font-scale)); margin: 4px; }\n');
});

test('font shorthand: size and line height', async () => {
	const read = await convert({ 'a.css': '.a { font: bold 11px/16px Verdana, sans-serif; } .b { font: normal 12px Arial; }\n' });
	assert.equal(await read('a.css'), '.a { font: bold calc(11px * var(--font-scale))/calc(16px * var(--font-scale)) Verdana, sans-serif; } .b { font: normal calc(12px * var(--font-scale)) Arial; }\n');
});

test('leaves body, non-px units, theme and print files alone', async () => {
	const src = 'body { font-size: 12px; } .a { font-size: 1.2em; line-height: 1; } .b { font-size: 100%; }\n';
	const read = await convert({ 'a.css': src, 'theme.css': '.x { font-size: 10px; }\n', 'print.css': '.x { font-size: 10px; }\n' });
	assert.equal(await read('a.css'), src);
	assert.equal(await read('theme.css'), '.x { font-size: 10px; }\n');
	assert.equal(await read('print.css'), '.x { font-size: 10px; }\n');
});
