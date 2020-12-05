<?php
/*-------------------------------------------------------
*
*   Show topic as page
*   Copyright © 2015 nyuk
*
---------------------------------------------------------
*/

/**
 * Регистрация хука для вывода меню страниц
 *
 */
class PluginPage_HookPage extends Hook {
	public function RegisterHook() {
		$this->AddHook('template_main_menu_item','Menu');
	}

	public function Menu() {
		$cur_lang = Config::Get('lang.current');
		$pages = array();
		foreach (Config::Get('plugin.page.pages') as $page) {
			$page['desc'] = isset($page['desc_'.$cur_lang]) ? $page['desc_'.$cur_lang] : $page['desc'];
			$page['event'] = $page['topic_id'].'.html';
			$pages[] = $page; 
		}
		$this->Viewer_Assign('aPagesMain', $pages);
		
		return $this->Viewer_Fetch(Plugin::GetTemplatePath(__CLASS__).'main_menu.tpl');
	}
}