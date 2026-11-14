import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseColor, toLab, darkTransform, contrast } from '../lib/color.mjs';

// Light highlight surfaces (current comment, mark, ins, notices) and the text on them
const SURFACES = ['#def7dc', '#ffff99', '#ff9', '#ccf4d0', '#c9eeff', '#4ec4ff', '#2e7851', '#cdf5a6'];
const TEXTS = ['#000000', '#333333', '#555555'];

test('saturated backgrounds stay dark enough for inverted text', () => {
	for (const s of SURFACES) {
		const bg = darkTransform('bg', parseColor(s));
		assert.ok(toLab(bg).L <= 22.5, `${s} → L ${toLab(bg).L.toFixed(1)}`);
		for (const t of TEXTS) {
			const fg = darkTransform('text', parseColor(t));
			assert.ok(contrast(fg, bg) >= 4.5, `${t} on ${s}: ${contrast(fg, bg).toFixed(2)}`);
		}
	}
});

test('dark neutrals and light text are kept', () => {
	assert.deepEqual(darkTransform('bg', parseColor('#000000')), { r: 0, g: 0, b: 0, a: 1 });
	const white = darkTransform('text', parseColor('#ffffff'));
	assert.ok(toLab(white).L > 99);
});
