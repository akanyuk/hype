<?php
/*-------------------------------------------------------
*
*   Random logo in header
*   Copyright © 2015 nyuk
*
---------------------------------------------------------
*/

class PluginRndLogo_HookRndLogo extends Hook {
	public function RegisterHook() {
		$this->AddHook('template_header_random_logo','RndLogo');
		
		if (isset($_GET['disable_animated_logo'])) {
			setcookie('ls_disable_animated_logo',  '1', time() + 60*60*24*1000, Config::Get('sys.cookie.path'), Config::Get('sys.cookie.host'));
		}
		elseif (isset($_GET['enable_animated_logo'])) {
			setcookie('ls_disable_animated_logo',  null, 0, Config::Get('sys.cookie.path'), Config::Get('sys.cookie.host'));
		}
	}

	public function RndLogo($aData) {
		include(Config::Get('path.smarty.template').'/rnd_logos/settings.php');

		// No variants
		if (!isset($rnd_logos) || !is_array($rnd_logos) || empty($rnd_logos)) return '';

		// Remove animated logos
		if (isset($_COOKIE['ls_disable_animated_logo']) && $_COOKIE['ls_disable_animated_logo']) {
			foreach ($rnd_logos as $key => $logo) {
				if (isset($logo['animated']) && $logo['animated']) {
					unset($rnd_logos[$key]);
				}
			}

			if (empty($rnd_logos)) return '';
		}

		// One variant
		if (count($rnd_logos) == 1) {
			$a = reset($rnd_logos);
			return '<a href="/" title="'.$a['title'].'"><img src="'.Config::Get('path.static.skin').'/rnd_logos/'.$a['filename'].'" /></a>';
		}

		// Many variants
		$last_rnd_logo = isset($_COOKIE['ls_last_rnd_logo']) ? intval($_COOKIE['ls_last_rnd_logo']) : -1;

		while (true) {
			$i = array_rand($rnd_logos);
			if ($i != $last_rnd_logo) {
				setcookie('ls_last_rnd_logo',  $i, 0, Config::Get('sys.cookie.path'), Config::Get('sys.cookie.host'));
				return '<a href="/" title="'.$rnd_logos[$i]['title'].'"><img src="'.Config::Get('path.static.skin').'/rnd_logos/'.$rnd_logos[$i]['filename'].'" /></a>';
			}
		}
	}
}
?>