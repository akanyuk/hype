<?php
/*-------------------------------------------------------
*
*   Show topic as page
*   Copyright © 2015 nyuk
*
---------------------------------------------------------
*/

Config::Set('router.page.page', 'PluginPage_ActionPage');


$config = array('pages' =>array(
	array('topic_id' => '781', 'desc' => 'Календарь', 'desc_english' => 'Calendar', 'mobile_icon_class' => 'icon-calendar-white'),
	array('topic_id' => '6', 'desc' => 'FAQ', 'desc_english' => 'FAQ', 'mobile_icon_class' => 'icon-faq-white'),
));

return $config;
