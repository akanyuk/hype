<?php
/**
 * Настройки для локального сервера.
 */

$config['view']['skin'] = 'synio-hype-mod';                                                              // шаблон(скин)
$config['view']['name'] = 'HYPE'; // название сайта
$config['view']['description'] = 'demoscene hype'; // seo description
$config['view']['keywords'] = 'demoscene, oldschool, zx-spectrum';      // seo keywords
$config['view']['img_resize_width'] = 640; // до какого размера в пикселях ужимать картинку по щирине при загрузки её в топики и комменты

$config['block']['stream']['row'] = 8;  // сколько записей выводить в блоке "Прямой эфир"
$config['block']['blogs']['row'] = 8;   // сколько записей выводить в блоке "Блоги"

$config['sys']['cookie']['time'] = 60 * 60 * 24 * 30; // время жизни куки когда пользователь остается залогиненым на сайте, 3 дня

$config['general']['reg']['invite'] = true; // использовать режим регистрации по приглашению или нет. Если использовать, то регистрация будет доступна ТОЛЬКО по приглашениям!

$config['acl']['create']['blog']['rating'] = 99999;  // порог рейтинга при котором юзер может создать коллективный блог
$config['acl']['create']['comment']['rating'] = -3; // порог рейтинга при котором юзер может добавлять комментарии
$config['acl']['create']['topic']['limit_rating'] = -5;// порог рейтинга при котором юзер может создавать топики (учитываются любые блоги, включая персональные), как дополнительная защита от спама/троллинга
$config['acl']['vote']['comment']['rating'] = -1;  // порог рейтинга при котором юзер может голосовать за комментарии
$config['acl']['vote']['blog']['rating'] = -2;  // порог рейтинга при котором юзер может голосовать за блог
$config['acl']['vote']['topic']['rating'] = -3;  // порог рейтинга при котором юзер может голосовать за топик
$config['acl']['vote']['user']['rating'] = 0;  // порог рейтинга при котором юзер может голосовать за пользователя

$config['module']['blog']['index_good']      =  0;   // Рейтинг топика выше которого(включительно) он попадает на главную
$config['module']['topic']['max_length'] = 65536*10;       // Максимальное количество символов в одном топике
$config['module']['user']['login']['min_size'] = 2; // Минимальное количество символов в логине
$config['module']['user']['time_active'] = 60*60*24*7; 		// Число секунд с момента последнего посещения пользователем сайта, в течение которых он считается активным
$config['module']['user']['usernote_per_page'] = 20; 	    // Число заметок на одну страницу
$config['module']['user']['profile_photo_width'] = 250; 	// ширина квадрата фотографии в профиле, px
$config['module']['user']['name_max'] = 30; 			  	// максимальная длинна имени в профиле пользователя
$config['module']['comment']['max_tree'] = 1;           // Максимальная вложенность комментов при отображении
$config['module']['ls']['send_general'] = false;	// Отправка на сервер LS общей информации о сайте (домен, версия LS и плагинов)

$config['block']['rule_index_blog'] = array(
    'action'  => array(
        'index', 'blog' => array('{topics}','{topic}','{blog}')
    ),
    'blocks'  => array(
        'right' => array(
            'stream'=>array('priority'=>150),
            'blocks/block.events.tpl' => array('priority'=>90),
            'blocks/block.advert.tpl' => array('priority'=>80),
            'tags'=>array('priority'=>50),
            'blogs'=>array('params'=>array(),'priority'=>2),
        )
    ),
    'clear' => false,
);

$config['db']['params']['host'] = 'mysql';
$config['db']['params']['port'] = '3306';
$config['db']['params']['type']   = 'mysqli';
$config['db']['table']['prefix'] = '';
$config['db']['params']['dbname'] = 'hype';
$config['db']['params']['user'] = 'root';
$config['db']['params']['pass'] = 'root';
$config['db']['tables']['engine'] = 'InnoDB';

$config['path']['root']['web'] = 'http://'.$_SERVER['HTTP_HOST'];
$config['path']['root']['server'] = dirname(__FILE__, 2);
$config['path']['offset_request_url'] = '0';

$config['compress']['css']['merge'] = true;
$config['compress']['js']['merge']  = true;

$config['sys']['mail']['type']             = 'smtp';                 	// Какой тип отправки использовать
$config['sys']['mail']['from_email']       = 'retroscene.bot@yandex.ru';// Мыло с которого отправляются все уведомления
$config['sys']['mail']['from_name']        = 'HypeBot';              	// Имя с которого отправляются все уведомления
$config['sys']['mail']['charset']          = 'UTF-8';                	// Какую кодировку использовать в письмах
$config['sys']['mail']['smtp']['host']     = 'maildev';      		// Настройки SMTP - хост
$config['sys']['mail']['smtp']['port']     = 25;                    	// Настройки SMTP - порт
$config['sys']['mail']['smtp']['user']     = 'hypebot';  		// Настройки SMTP - пользователь
$config['sys']['mail']['smtp']['password'] = '';             		// Настройки SMTP - пароль
$config['sys']['mail']['smtp']['secure']   = 'ssl';                  	// Настройки SMTP - протокол шифрования: tls, ssl
$config['sys']['mail']['smtp']['auth']     = true;                   	// Использовать авторизацию при отправке

// Manticore runs in the searchd docker service
$config['module']['search']['sphinx']['host'] = 'searchd';

return $config;
