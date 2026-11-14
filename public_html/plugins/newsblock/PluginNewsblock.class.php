<?php
/*-------------------------------------------------------
*
*   Show blog topics as news block in sidebar.
*   Copyright � 2015 nyuk
*
--------------------------------------------------------*/

if (!class_exists('Plugin')) {
	die('Hacking attempt!');
}


class PluginNewsblock extends Plugin {
	public $aInherits = array(
		'module' => array(
			'ModuleTopic',
		),
		'mapper' => array(
			'ModuleTopic_MapperTopic',
		),
	);
	
	public function Activate() {
		return true;
	}


	public function Init() {}

}
