import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const TOOL = new URL('../themeify.mjs', import.meta.url).pathname;

async function skin(files) {
	const dir = await mkdtemp(join(tmpdir(), 'themeify-'));
	await mkdir(join(dir, 'css'));
	await writeFile(join(dir, 'css', 'theme.css'), ':root {\n\t--font-scale: 1;\n}\n');
	for (const [name, css] of Object.entries(files)) await writeFile(join(dir, 'css', name), css);
	return dir;
}
const run = (dir, ...flags) => execFileSync('node', [TOOL, dir, '--write', ...flags], { encoding: 'utf8' });
const read = (dir, name) => readFile(join(dir, 'css', name), 'utf8');

test('replaces colors by kind and keeps exact light values', async () => {
	const dir = await skin({ 'a.css': 'a:hover { color: #333; background: #FFF; border: 1px solid #eee; }\n' });
	run(dir);
	const css = await read(dir, 'a.css');
	assert.equal(css, 'a:hover { color: var(--text-gray-21); background: var(--bg-gray-100); border: 1px solid var(--border-gray-94); }\n');
	const theme = await read(dir, 'theme.css');
	assert.match(theme, /--text-gray-21: #333333;/);
	assert.match(theme, /--bg-gray-100: #ffffff;/);
	assert.match(theme, /--font-scale: 1;/);
});

test('same color in the same kind maps to one token; #fff and white are equal', async () => {
	const dir = await skin({ 'a.css': '.x { background: #fff; } .y { background-color: white; } .z { color: #fff; }\n' });
	run(dir);
	assert.equal(await read(dir, 'a.css'), '.x { background: var(--bg-gray-100); } .y { background-color: var(--bg-gray-100); } .z { color: var(--text-gray-100); }\n');
});

test('leaves comments, urls, IE filters and selectors untouched', async () => {
	const src = '/* #fff */ .white-icon { background: url(../images/white.png) no-repeat #fff; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#ffffff\'); }\n';
	const dir = await skin({ 'a.css': src });
	run(dir);
	assert.equal(await read(dir, 'a.css'), '/* #fff */ .white-icon { background: url(../images/white.png) no-repeat var(--bg-gray-100); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#ffffff\'); }\n');
});

test('gradients and shadows with alpha', async () => {
	const dir = await skin({ 'a.css': '.b { background: linear-gradient(to bottom, #fff 0%, #eee 100%); box-shadow: 0 1px 2px rgba(0,0,0,.2); }\n' });
	run(dir);
	assert.equal(await read(dir, 'a.css'), '.b { background: linear-gradient(to bottom, var(--bg-gray-100) 0%, var(--bg-gray-94) 100%); box-shadow: 0 1px 2px var(--shadow-black-0-a20); }\n');
	assert.match(await read(dir, 'theme.css'), /--shadow-black-0-a20: rgba\(0, 0, 0, 0.2\);/);
});

test('rerun is stable and --dark writes a dark block', async () => {
	const dir = await skin({ 'a.css': '.x { color: #333; background: #fff; }\n' });
	run(dir);
	const once = await read(dir, 'a.css');
	run(dir, '--dark');
	assert.equal(await read(dir, 'a.css'), once);
	const theme = await read(dir, 'theme.css');
	assert.equal(theme.match(/--text-gray-21:/g).length, 2); // light + dark
	assert.match(theme, /html\[data-theme="dark"\] \{[\s\S]*--bg-gray-100: #[0-9a-f]{6};/);
});

test('prefixes the browser rejects stay literal (var() would void the fallback chain)', async () => {
	const src = '.g { background: #eee; background: -moz-linear-gradient(top, #fff 0%, #eee 100%); background: -webkit-gradient(linear, left top, left bottom, from(#fff), to(#eee)); background: -o-linear-gradient(top, #fff, #eee); background: -webkit-linear-gradient(top, #fff, #eee); background: linear-gradient(to bottom, #fff, #eee); }\n';
	const dir = await skin({ 'a.css': src });
	run(dir);
	assert.equal(await read(dir, 'a.css'), '.g { background: var(--bg-gray-94); background: -moz-linear-gradient(top, #fff 0%, #eee 100%); background: -webkit-gradient(linear, left top, left bottom, from(var(--bg-gray-100)), to(var(--bg-gray-94))); background: -o-linear-gradient(top, #fff, #eee); background: -webkit-linear-gradient(top, var(--bg-gray-100), var(--bg-gray-94)); background: linear-gradient(to bottom, var(--bg-gray-100), var(--bg-gray-94)); }\n');
});

test('declarations the browser rejects stay literal', async () => {
	const src = '.b { background: #fbfcfc; background: linear-gradient(top, #fbfcfc 0%, #f0f2f5 100%); }\n';
	const dir = await skin({ 'a.css': src });
	run(dir);
	assert.equal(await read(dir, 'a.css'), '.b { background: var(--bg-gray-99); background: linear-gradient(top, #fbfcfc 0%, #f0f2f5 100%); }\n');
});
