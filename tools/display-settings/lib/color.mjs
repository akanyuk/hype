// Color helpers for themeify.mjs and contrast checks

const NAMED = { white: [255, 255, 255], black: [0, 0, 0], red: [255, 0, 0] };

export function parseColor(s) {
	s = s.trim().toLowerCase();
	if (NAMED[s]) { const [r, g, b] = NAMED[s]; return { r, g, b, a: 1 }; }
	let m = s.match(/^#([0-9a-f]{3})$/);
	if (m) { const [r, g, b] = [...m[1]].map((c) => parseInt(c + c, 16)); return { r, g, b, a: 1 }; }
	m = s.match(/^#([0-9a-f]{6})$/);
	if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
	m = s.match(/^rgba?\(([^)]*)\)$/);
	if (m) {
		const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
		return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
	}
	throw new Error(`unparsed color: ${s}`);
}

const hex2 = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');

export function formatColor({ r, g, b, a }) {
	if (a < 1) return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${+a.toFixed(2)})`;
	return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const unlin = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function luminance({ r, g, b }) {
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a, b) {
	const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
}

// sRGB <-> CIE Lab (D65)
const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
const fi = (t) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));

export function toLab({ r, g, b }) {
	const [R, G, B] = [lin(r), lin(g), lin(b)];
	const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
	const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
	const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
	const [fx, fy, fz] = [f(X), f(Y), f(Z)];
	return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

export function fromLab({ L, a, b }, alpha = 1) {
	const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
	const X = fi(fx) * 0.95047, Y = fi(fy), Z = fi(fz) * 1.08883;
	const R = 3.2406 * X - 1.5372 * Y - 0.4986 * Z;
	const G = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
	const B = 0.0557 * X - 0.204 * Y + 1.057 * Z;
	return { r: unlin(Math.max(0, Math.min(1, R))), g: unlin(Math.max(0, Math.min(1, G))), b: unlin(Math.max(0, Math.min(1, B))), a: alpha };
}

export function family(c) {
	const { a, b } = toLab(c);
	const chroma = Math.hypot(a, b);
	if (chroma < 8) return c.r + c.g + c.b < 1 && c.a < 1 ? 'black' : 'gray';
	const h = (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
	if (h < 20 || h >= 345) return 'red';
	if (h < 60) return 'orange';
	if (h < 100) return 'yellow';
	if (h < 165) return 'green';
	if (h < 230) return 'cyan';
	if (h < 300) return 'blue';
	return 'purple';
}

/**
 * Dark theme value for a token. Neutral light surfaces become dark surfaces
 * (keeping their order), dark text becomes light text, saturated accents keep
 * their hue with lightness adjusted for a dark background. Colors that are
 * already "dark-theme-like" (dark backgrounds, light text) stay as they are.
 */
export function darkTransform(kind, c) {
	const lab = toLab(c);
	const chroma = Math.hypot(lab.a, lab.b);
	const k = chroma < 8 ? 1 : Math.max(0.35, 1 - chroma / 120);
	let L = lab.L;
	let s = 1;
	switch (kind) {
		case 'bg':
			if (L > 50) { L = 9 + (100 - L) * 0.6; s = chroma > 40 ? 0.85 : 0.45; }
			if (chroma > 40 && lab.L > 50) L = Math.max(L, lab.L * 0.62);
			break;
		case 'text':
			if (L < 60) { L = 92 - L * (0.45 * k + 0.3); s = 0.9; }
			break;
		case 'border':
			if (L > 50) { L = 18 + (100 - L) * 0.55; s = chroma > 40 ? 0.8 : 0.4; }
			break;
		case 'shadow':
			if (L > 50) { L = 6 + (100 - L) * 0.3; s = 0.4; }
			break;
	}
	return fromLab({ L, a: lab.a * s, b: lab.b * s }, c.a);
}
