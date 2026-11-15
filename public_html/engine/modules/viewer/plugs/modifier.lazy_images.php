<?php
/**
 * Smarty plugin - lazy_images modifier
 * @package Smarty
 * @subpackage plugins
 */

/**
 * Модификатор lazy_images: картинки в пользовательском тексте (топики, комментарии, стена, письма)
 * загружаются браузером только при приближении к экрану. Картинки с явным loading не меняются.
 *
 * @param string $sHtml
 * @return string
 */
function smarty_modifier_lazy_images($sHtml)
{
	return preg_replace('#<img\b(?![^>]*\sloading\s*=)#i', '<img loading="lazy"', (string)$sHtml);
}
