<?php
/*-------------------------------------------------------
*
*   Show topic as page
*   Copyright © 2015 nyuk
*
*--------------------------------------------------------
*/

/**
 * Экшен обработки URL'ов вида /page/
 *
 * @package actions
 * @since 1.0
 */
class PluginPage_ActionPage extends Action {
	/**
	 * Главное меню
	 *
	 * @var string
	 */
	protected $sMenuHeadItemSelect = null;
	
	/**
	 * Текущий пользователь
	 *
	 * @var ModuleUser_EntityUser|null
	 */
	protected $oUserCurrent = null;

	/**
	 * Инизиализация экшена
	 *
	 */
	public function Init() {
		/**
		 * Достаём текущего пользователя
		 */
		$this->oUserCurrent = $this->User_GetUserCurrent();
	}
	
	/**
	 * Регистрируем евенты, по сути определяем УРЛы вида /page/.../
	 *
	 */
	protected function RegisterEvent() {
		$this->AddEventPreg('/^(\d+)\.html$/i','/^$/i',array('EventShowTopic','topic'));
	}


	/**********************************************************************************
	 ************************ РЕАЛИЗАЦИЯ ЭКШЕНА ***************************************
	 **********************************************************************************
	 */

	/**
	 * Показ топика
	 *
	 */
	protected function EventShowTopic() {
		$iTopicId = $this->GetEventMatch(1);
		
		/**
		 * Проверяем есть ли такой топик
		 */
		if (!($oTopic=$this->Topic_GetTopicById($iTopicId))) {
			return parent::EventNotFound();
		}
		
		/**
		 * Проверяем права на просмотр топика
		 */
		if (!$oTopic->getPublish() and (!$this->oUserCurrent or ($this->oUserCurrent->getId()!=$oTopic->getUserId() and !$this->oUserCurrent->isAdministrator()))) {
			return parent::EventNotFound();
		}
		
		/**
		 * Определяем права на отображение записи из закрытого блога
		 */
		if($oTopic->getBlog()->getType()=='close'
			and (!$this->oUserCurrent
				|| !in_array(
					$oTopic->getBlog()->getId(),
					$this->Blog_GetAccessibleBlogsByUser($this->oUserCurrent)
				)
			)
		) {
			$this->Message_AddErrorSingle($this->Lang_Get('blog_close_show'),$this->Lang_Get('not_access'));
			return Router::Action('error');
		}
		
		/**
		 * Выставляем SEO данные
		 */
		$sTextSeo=strip_tags($oTopic->getText());
		$this->Viewer_SetHtmlDescription(func_text_words($sTextSeo, Config::Get('seo.description_words_count')));
		$this->Viewer_SetHtmlKeywords($oTopic->getTags());
		$this->Viewer_SetHtmlCanonical($oTopic->getUrl());
		
		// Вызов хуков
		#$this->Hook_Run('topic_show',array("oTopic"=>$oTopic));
		
		// Загружаем переменные в шаблон
		$this->Viewer_Assign('oTopic', $oTopic);
		$this->Viewer_Assign('aPluginLang', $this->Lang_Get('plugin.page'));
		
		// Устанавливаем title страницы
		$this->Viewer_AddHtmlTitle($oTopic->getTitle());
		
		// Устанавливаем активную ссылку в шапке
		$this->sMenuHeadItemSelect = 'page/'.$oTopic->getId().'.html';
		
		// Устанавливаем шаблон вывода
		$this->SetTemplateAction('topic');
	}
	
	/**
	 * Выполняется при завершении работы экшена
	 *
	 */
	public function EventShutdown() {
		/**
		 * Загружаем в шаблон необходимые переменные
		 */
		$this->Viewer_Assign('sMenuHeadItemSelect', $this->sMenuHeadItemSelect);
	}
}