<?php
/*-------------------------------------------------------
*
*   Copyright © 2015 nyuk
*
*--------------------------------------------------------
*/

/**
 * Экшен отправки запроса на инвайт
 *
 * @package actions
 * @since 1.0
 */
class PluginInvreq_ActionSend extends Action {
	public function Init() {
		$this->Viewer_SetResponseAjax('json', false, false);
		$this->SetDefaultEvent('send');
	}
	
	protected function RegisterEvent() {
		$this->AddEvent('send','Send');
	}
	
	protected function Send() {
		$text = isset($_POST['text']) ? trim($_POST['text']) : false;
		$email = isset($_POST['email']) ? $_POST['email'] : false;
		
		if (!$email) {
			$this->Message_AddErrorSingle('Вы забыли указать свой e-mail адрес.');
			return;
		}
		
		if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
			$this->Message_AddErrorSingle('Вы ошиблись при наборе e-mail адреса.');
			return;
		}
		
		if (!$text) {
			$this->Message_AddErrorSingle('Пожалуйста, напишите что-нибудь.');
			return;
		}

		if (strlen($text) < 10) {
			$this->Message_AddErrorSingle('Вы слишком мало написали о себе.');
			return;
		}

		$cfg = Config::Get('plugin.invreq');

		$this->Mail_SetSubject($cfg['mail_subject']);
		$this->Mail_SetBody($cfg['mail_body_prefix'].$email."\n\n".$text);
		$this->Mail_setPlain();
		
		$this->Mail_ClearAddresses();
		foreach ($cfg['mail_recipients'] as $mail_to) {
			$this->Mail_AddAdress($mail_to);
		}
		
		$this->Mail_Send();
		
		$this->Message_AddNoticeSingle('Запрос отправлен.');
		return;
	}
}