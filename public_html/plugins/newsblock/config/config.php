<?php
$config = array(
	'sidebar_good'	=> 0,	// Рейтинг топика выше которого(включительно) он попадает в новостную ленту
	'blog_url' 		=> 'news',
	'topics_count' 	=> 5,
	'header' 		=> 'Новости',
	'all_news' 		=> 'Все новости',
);

Config::Set('block.rule_newsblock', array(
//	'path' => '',
	'action'  => array(
			'index', 'blog' => array('{topics}','{topic}','{blog}')
	),
	'blocks' => array(
		'right' => array(
			'newsblock' => array(
				'params' => array('plugin' => 'newsblock'),
				'priority' => 120,
			),
		)
	),
));

return $config;