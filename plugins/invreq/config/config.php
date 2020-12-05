<?php
/*-------------------------------------------------------
*
*   Copyright © 2015 nyuk
*
---------------------------------------------------------
*/

Config::Set('router.page.invitation_request', 'PluginInvreq_ActionSend');

$config = array(
	'mail_recipients' => array(
		'aka.nyuk@gmail.com', 
		'diver4d@gmail.com', 
		'zxintrospec@gmail.com', 
		'nodeus@yandex.ru', 
		'sq.skrju@gmail.com'
	),
	'mail_subject' => 'HYPE: запрос инвайта',
	'mail_body_prefix' => 'Запрос инвайта для e-mail адреса: ',

	'header' 	=> 'Привет!',
	'text' 		=> 'На хайпе работает система инвайтов (приглашений). Мы выслали приглашения всем, кого знали и чей e-mail у нас был. Конечно мы кого-то упустили. Поэтому если вы хотите быть на хайпе, напишите нам пару строк о себе и мы вышлем вам приглашение. Более подробно о том, как устроен хайп написано <a href="http://hype.retroscene.org/page/6.html">здесь</a>.',
	'email_label' => 'Ваш e-mail',
	'button_label' => 'Хочу на HYPE',
);

return $config;
