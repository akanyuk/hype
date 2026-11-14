{* Applies stored display settings before CSS loads, so the page never flashes the wrong theme *}
<meta name="theme-color" content="#000000">
<script type="text/javascript">
{literal}
(function (w, d) {
	var valid = { theme: ['light', 'dark'], font: ['normal', 'large'] };
	function read(name) {
		try {
			var value = w.localStorage.getItem('hype-' + name);
			return valid[name].indexOf(value) >= 0 ? value : null;
		} catch (e) {
			return null;
		}
	}
	function system() {
		return w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	d.documentElement.setAttribute('data-theme', read('theme') || system());
	d.documentElement.setAttribute('data-font', read('font') || 'normal');
	w.hypeDisplay = { valid: valid, read: read, system: system };
})(window, document);
{/literal}
</script>
