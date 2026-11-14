<?php
/*-------------------------------------------------------
*
*   Random logo in header
*   Copyright © 2015 nyuk
*
---------------------------------------------------------
*/

class PluginRndlogo_HookRndlogo extends Hook {
	public function RegisterHook() {
		$this->AddHook('template_header_random_logo','RndLogo');
		
		if (isset($_GET['disable_animated_logo'])) {
			setcookie('ls_disable_animated_logo',  '1', time() + 60*60*24*1000, Config::Get('sys.cookie.path'), Config::Get('sys.cookie.host'));
		}
		elseif (isset($_GET['enable_animated_logo'])) {
			setcookie('ls_disable_animated_logo',  null, 0, Config::Get('sys.cookie.path'), Config::Get('sys.cookie.host'));
		}

        Config::Set('path.rnd-logo.skin', '___path.root.web___/plugins/rndlogo/images');
	}

	public function RndLogo($aData) {
	    $images = Config::Get('plugin.rndlogo.images');

		// Remove animated logos
		if (isset($_COOKIE['ls_disable_animated_logo']) && $_COOKIE['ls_disable_animated_logo']) {
			foreach ($images as $key => $logo) {
				if (isset($logo['animated']) && $logo['animated']) {
					unset($images[$key]);
				}
			}

			if (empty($images)) {
			    return '';
            }
		}

		// One variant
		if (count($images) == 1) {
			$a = reset($images);
			return '<a href="/" title="'.$a['title'].'"><img src="'.Config::Get('path.rnd-logo.skin').'/'.$a['filename'].'" /></a>';
		}

		// Many variants
		$lastRndLogo = isset($_COOKIE['ls_last_rndlogo']) ? intval($_COOKIE['ls_last_rndlogo']) : -1;

		while (true) {
			$i = array_rand($images);
			if ($i != $lastRndLogo) {
				setcookie('ls_last_rndlogo',  $i, 0, Config::Get('sys.cookie.path'), Config::Get('sys.cookie.host'));
				return '<a href="/" title="'.$images[$i]['title'].'"><img src="'.Config::Get('path.rnd-logo.skin').'/'.$images[$i]['filename'].'" /></a>';
			}
		}
	}
}