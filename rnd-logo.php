<?php
$base_path = dirname(__FILE__).'/templates/skin/synio-hype-mod/rnd_logos/';
require $base_path.'settings.php';

// 10 retry's
$i = 0;
while ($i++ < 10) {
	$file = $rnd_logos[array_rand($rnd_logos)];
	$fullpath = $base_path.$file['filename'];
	
	if (!$info = getimagesize($fullpath)) continue;
	
	header('Content-type: '.$info['mime']);
	header('Content-Length: '.filesize($fullpath));
	//header('Content-Disposition: attachment; filename="'.$file['filename'].'"');
	header('Content-Transfer-Encoding: binary');
	header('Connection: close');
	readfile($fullpath);
	exit;
}