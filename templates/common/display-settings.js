/**
 * Display settings: theme (light/dark) and font size (normal/large).
 * Early state is applied by display-settings-head.tpl; this file adds
 * switching, persistence, system theme tracking and cross-tab sync.
 */
(function (w, d) {
	var display = w.hypeDisplay;
	if (!display) {
		return;
	}
	var root = d.documentElement;
	var defaults = { theme: display.system, font: function () { return 'normal'; } };
	var on = { theme: 'dark', font: 'large' };

	function save(name, value) {
		try {
			w.localStorage.setItem('hype-' + name, value);
		} catch (e) {
			// Storage is unavailable (private mode): the choice lives until reload
		}
	}

	function updateThemeColor() {
		var meta = d.querySelector('meta[name="theme-color"]');
		var color = w.getComputedStyle(root).getPropertyValue('--bg-header').replace(/^\s+|\s+$/g, '');
		if (meta) {
			meta.setAttribute('content', root.getAttribute('data-theme') === 'dark' && color ? color : '#000000');
		}
	}

	function updateButtons() {
		var buttons = d.querySelectorAll('[data-display-toggle]');
		for (var i = 0; i < buttons.length; i++) {
			var name = buttons[i].getAttribute('data-display-toggle');
			var active = display.get(name) === on[name];
			var label = buttons[i].getAttribute(active ? 'data-label-on' : 'data-label-off');
			buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
			if (label) {
				buttons[i].setAttribute('title', label);
				buttons[i].setAttribute('aria-label', label);
			}
		}
	}

	function apply(name, value) {
		root.setAttribute('data-' + name, value);
		updateButtons();
		if (name === 'theme') {
			updateThemeColor();
		}
	}

	display.get = function (name) {
		return root.getAttribute('data-' + name);
	};

	display.set = function (name, value) {
		if (!display.valid[name] || display.valid[name].indexOf(value) < 0) {
			return;
		}
		save(name, value);
		apply(name, value);
	};

	display.toggle = function (name) {
		var values = display.valid[name];
		display.set(name, display.get(name) === values[0] ? values[1] : values[0]);
	};

	d.addEventListener('click', function (e) {
		var target = e.target.closest ? e.target.closest('[data-display-toggle]') : null;
		if (target) {
			e.preventDefault();
			display.toggle(target.getAttribute('data-display-toggle'));
		}
	});

	// Follow the system theme until the visitor makes an explicit choice
	if (w.matchMedia) {
		var query = w.matchMedia('(prefers-color-scheme: dark)');
		var onSystemChange = function () {
			if (!display.read('theme')) {
				apply('theme', display.system());
			}
		};
		if (query.addEventListener) {
			query.addEventListener('change', onSystemChange);
		} else if (query.addListener) {
			query.addListener(onSystemChange);
		}
	}

	// Another tab changed a setting
	w.addEventListener('storage', function (e) {
		var match = e.key && e.key.match(/^hype-(theme|font)$/);
		if (match) {
			apply(match[1], display.read(match[1]) || defaults[match[1]]());
		}
	});

	if (d.readyState === 'loading') {
		d.addEventListener('DOMContentLoaded', function () {
			updateButtons();
			updateThemeColor();
		});
	} else {
		updateButtons();
		updateThemeColor();
	}
})(window, document);
