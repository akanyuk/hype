<?php
/**
 * Link previews in social networks and messengers (Open Graph, Twitter Card).
 * Topic, profile and blog pages describe their object; other pages use the site defaults.
 * Without an own picture the site logo is used.
 */
class HookOpengraph extends Hook {
	/**
	 * Description length in characters
	 */
	const DESCRIPTION_LENGTH = 200;
	/**
	 * Site logo for pages without an own picture
	 */
	const LOGO = '/favicon/image_src.png';

	public function RegisterHook() {
		$this->AddHook('template_html_head_end', 'Meta', __CLASS__);
	}

	/**
	 * Meta tags for the current page
	 *
	 * @return string
	 */
	public function Meta() {
		$oSmarty = $this->Viewer_GetSmartyObject();
		if ($oTopic = $oSmarty->getTemplateVars('oTopic')) {
			$aMeta = $this->TopicMeta($oTopic);
		} elseif ($oUser = $oSmarty->getTemplateVars('oUserProfile')) {
			$aMeta = $this->UserMeta($oUser);
		} elseif ($oBlog = $oSmarty->getTemplateVars('oBlog')) {
			$aMeta = $this->BlogMeta($oBlog);
		} else {
			$aMeta = $this->PageMeta($oSmarty);
		}

		$sImage = $aMeta['image'] ? $this->AbsoluteUrl($aMeta['image']) : $this->AbsoluteUrl(self::LOGO);
		$aTags = array(
			'og:site_name' => Config::Get('view.name'),
			'og:type' => $aMeta['type'],
			'og:title' => $aMeta['title'],
			'og:description' => $aMeta['description'],
			'og:url' => $this->AbsoluteUrl($aMeta['url']),
			'og:image' => $sImage,
			'og:locale' => 'ru_RU',
		);
		$sHtml = '';
		foreach ($aTags as $sProperty => $sContent) {
			$sHtml .= '<meta property="'.$sProperty.'" content="'.htmlspecialchars($sContent, ENT_QUOTES, 'UTF-8').'">'."\n";
		}
		// A large picture only for an own image: the logo stays a small thumbnail
		$sHtml .= '<meta name="twitter:card" content="'.($aMeta['image'] ? 'summary_large_image' : 'summary').'">'."\n";
		return $sHtml;
	}

	/**
	 * Topic: title, author and the beginning of the text, main photo or the first picture
	 *
	 * @param ModuleTopic_EntityTopic $oTopic
	 * @return array
	 */
	protected function TopicMeta($oTopic) {
		$sAuthor = 'Автор: '.$oTopic->getUser()->getLogin().'.';
		$sText = $this->PlainText($oTopic->getText());
		if ($sText === '') {
			$sText = 'Топик в блоге «'.$this->PlainText($oTopic->getBlog()->getTitle()).'».';
		}

		$sImage = null;
		if ($oTopic->getType() == 'photoset' and $oPhoto = $this->Topic_getTopicPhotoById($oTopic->getPhotosetMainPhotoId())) {
			$sImage = $oPhoto->getWebPath(1000);
		}
		if (!$sImage and preg_match('#<img\s[^>]*src\s*=\s*["\']((?:https?:)?/[^"\']+)["\']#i', $oTopic->getText(), $aMatch)) {
			$sImage = html_entity_decode($aMatch[1], ENT_QUOTES, 'UTF-8');
		}

		return array(
			'type' => 'article',
			'title' => $this->PlainText($oTopic->getTitle()),
			'description' => $this->Cut($sAuthor.' '.$sText),
			'url' => $oTopic->getUrl(),
			'image' => $sImage,
		);
	}

	/**
	 * User: full name and login, photo or avatar
	 *
	 * @param ModuleUser_EntityUser $oUser
	 * @return array
	 */
	protected function UserMeta($oUser) {
		$sLogin = $oUser->getLogin();
		$sName = $this->PlainText($oUser->getProfileName());
		$sImage = null;
		if ($oUser->getProfileFoto()) {
			$sImage = $oUser->getProfileFoto();
		} elseif ($oUser->getProfileAvatar()) {
			$sImage = $oUser->getProfileAvatarPath(0);
		}

		return array(
			'type' => 'profile',
			'title' => ($sName !== '' and $sName != $sLogin) ? $sName.' ('.$sLogin.')' : $sLogin,
			'description' => 'Профиль пользователя '.$sLogin.' на '.Config::Get('view.name'),
			'url' => $oUser->getUserWebPath(),
			'image' => $sImage,
		);
	}

	/**
	 * Blog: title, description, avatar
	 *
	 * @param ModuleBlog_EntityBlog $oBlog
	 * @return array
	 */
	protected function BlogMeta($oBlog) {
		$sDescription = $this->PlainText($oBlog->getDescription());

		return array(
			'type' => 'website',
			'title' => $this->PlainText($oBlog->getTitle()),
			'description' => $sDescription !== '' ? $this->Cut($sDescription) : 'Блог на '.Config::Get('view.name'),
			'url' => $oBlog->getUrlFull(),
			'image' => $oBlog->getAvatar() ? $oBlog->getAvatarPath(0) : null,
		);
	}

	/**
	 * Any other page: its title and description
	 *
	 * @param Smarty $oSmarty
	 * @return array
	 */
	protected function PageMeta($oSmarty) {
		$sUrl = $oSmarty->getTemplateVars('sHtmlCanonical');
		if (!$sUrl) {
			$sUrl = parse_url(isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH);
		}

		return array(
			'type' => 'website',
			'title' => $this->PlainText($oSmarty->getTemplateVars('sHtmlTitle')),
			'description' => $this->Cut($this->PlainText($oSmarty->getTemplateVars('sHtmlDescription'))),
			'url' => html_entity_decode($sUrl, ENT_QUOTES, 'UTF-8'),
			'image' => null,
		);
	}

	/**
	 * HTML to a single line of plain text
	 *
	 * @param string $sHtml
	 * @return string
	 */
	protected function PlainText($sHtml) {
		$sText = preg_replace('#<(br|/p|/div|/li|/h\d)\b[^>]*>#i', ' ', (string)$sHtml);
		$sText = html_entity_decode(strip_tags($sText), ENT_QUOTES, 'UTF-8');
		return trim(preg_replace('#\s+#u', ' ', $sText));
	}

	/**
	 * Shortens text to DESCRIPTION_LENGTH on a word boundary
	 *
	 * @param string $sText
	 * @return string
	 */
	protected function Cut($sText) {
		if (mb_strlen($sText, 'UTF-8') <= self::DESCRIPTION_LENGTH) {
			return $sText;
		}
		$sText = mb_substr($sText, 0, self::DESCRIPTION_LENGTH - 1, 'UTF-8');
		$iSpace = mb_strrpos($sText, ' ', 0, 'UTF-8');
		if ($iSpace > self::DESCRIPTION_LENGTH / 2) {
			$sText = mb_substr($sText, 0, $iSpace, 'UTF-8');
		}
		return rtrim($sText, ' ,.;:-—').'…';
	}

	/**
	 * Absolute URL: previews need the host. Own URLs follow the scheme of the request.
	 *
	 * @param string $sUrl
	 * @return string
	 */
	protected function AbsoluteUrl($sUrl) {
		$bHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off')
			|| (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https');
		$sScheme = $bHttps ? 'https' : 'http';
		$sHost = preg_replace('#^https?://#i', '', rtrim(Config::Get('path.root.web'), '/'));

		if (strpos($sUrl, '//') === 0) {
			$sUrl = $sScheme.':'.$sUrl;
		} elseif (strpos($sUrl, '/') === 0) {
			$sUrl = $sScheme.'://'.$sHost.$sUrl;
		} else {
			$sUrl = preg_replace('#^https?://(?='.preg_quote($sHost, '#').'(/|$))#i', $sScheme.'://', $sUrl);
		}
		return $this->MergeSlashes($sUrl);
	}

	/**
	 * Collapses repeated slashes in the path (stored photo paths may contain "//")
	 *
	 * @param string $sUrl
	 * @return string
	 */
	protected function MergeSlashes($sUrl) {
		if (!preg_match('#^(https?://[^/]+)(/[^?\#]*)(.*)$#i', $sUrl, $aMatch)) {
			return $sUrl;
		}
		return $aMatch[1].preg_replace('#/{2,}#', '/', $aMatch[2]).$aMatch[3];
	}
}
