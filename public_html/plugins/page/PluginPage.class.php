<?php
/*-------------------------------------------------------
*
*   Show topic as page
*   Copyright © 2015 nyuk
*
---------------------------------------------------------
*/

/**
 * Запрещаем напрямую через браузер обращение к этому файлу.
 */
if (!class_exists('Plugin')) {
	die('Hacking attempt!');
}

class PluginPage extends Plugin {


	/**
	 * Активация плагина "Статические страницы".
	 */
	public function Activate() {
		return true;
	}

	/**
	 * Инициализация плагина
	 */
	public function Init() {

	}
}
?>