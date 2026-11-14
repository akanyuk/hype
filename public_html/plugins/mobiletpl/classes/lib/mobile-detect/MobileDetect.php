<?php
class MobileDetect {
	static protected $bIsNeedShowMobile=null;
	
	/**
	 * Определение типа устройства - мобильное или нет
	 *
	 * @return bool
	 */
	static public function DetectMobileDevice() {
	    require_once(dirname(dirname(__FILE__)).'/../../vendor/Mobile_Detect.php');
	    $detect = new Mobile_Detect;
	    
	    return $detect->isMobile() && !$detect->isTablet(); // Exclude tablets.
	}

	static public function IsNeedShowMobile() {
		if (!is_null(self::$bIsNeedShowMobile)) {
			return self::$bIsNeedShowMobile;
		}
		
		/**
		 * Принудительно включаем мобильную версию
		 */
		if (getRequest('force-mobile',false,'get')=='on') {
			setcookie('use_mobile',1,time()+60*60*24*90,Config::Get('sys.cookie.path'),Config::Get('sys.cookie.host'),false);
			return self::$bIsNeedShowMobile=true;
		}
		
		/**
		 * Принудительно выключаем полную версию
		 */
		if (getRequest('force-mobile',false,'get')=='off') {
			setcookie('use_mobile',0,time()+60*60*24*90,Config::Get('sys.cookie.path'),Config::Get('sys.cookie.host'),false);
			return self::$bIsNeedShowMobile=false;
		}
		
		/**
		 * Пользователь уже использует мобильную или полную версию
		 */
		if (isset($_COOKIE['use_mobile'])) {
			if ($_COOKIE['use_mobile']) {
				return self::$bIsNeedShowMobile=true;
			} else {
				return self::$bIsNeedShowMobile=false;
			}
		}
		
		/**
		 * Запускаем авто-определение мобильного клиента
		 */
		if (self::DetectMobileDevice()) {
			setcookie('use_mobile',1,time()+60*60*24*90,Config::Get('sys.cookie.path'),Config::Get('sys.cookie.host'),false);
			return self::$bIsNeedShowMobile=true;
		} else {
			setcookie('use_mobile',0,time()+60*60*24*90,Config::Get('sys.cookie.path'),Config::Get('sys.cookie.host'),false);
			return self::$bIsNeedShowMobile=false;
		}
	}

	static public function IsMobileTemplate($bHard=true) {
		if ($bHard) {
			return self::IsNeedShowMobile();
		} else {
			return Config::Get('plugin.mobiletpl.template') && Config::Get('view.skin')==Config::Get('plugin.mobiletpl.template');
		}
	}
}
