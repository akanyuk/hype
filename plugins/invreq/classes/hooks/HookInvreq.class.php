<?php
/*-------------------------------------------------------
*
*   Request invitation form
*   Copyright © 2015 nyuk
*
---------------------------------------------------------
*/

class PluginInvreq_HookInvreq extends Hook {
	public function RegisterHook() {
		$this->AddHook('template_request_invitation','InvreqForm');
	}

	public function InvreqForm($aData) {
		$cfg = Config::Get('plugin.invreq');
		
		ob_start();		
?>
<script type="text/javascript">
$(document).ready(function(){
	$('button[id="request-invite"]').click(function(){
		var text = $(this).closest('form').find('#request-invite-text').val();
		var email = $(this).closest('form').find('#request-invite-email').val();

		$.post('/invitation_request', { 'text': text, 'email': email }, function(response) {
			if (response.bStateError) {
				ls.msg.error(null, response.sMsg);
			}
			else {
				$('#request-invite-container').remove();

				setTimeout(function(){
					ls.msg.notice(null, response.sMsg);
				}, 500);
			}
		}, 'json');

		
		return false;
	});
});
</script>
<div id="request-invite-container" style="padding-top: 30px;">
	<h2 class="page-header"><?php echo $cfg['header']?></h2>
	<p><?php echo $cfg['text']?></p>
	<br />
	<form>
		<p><textarea rows="6" cols="20" id="request-invite-text" class="input-text input-width-300"></textarea></p>
		<p>
			<label><?php echo $cfg['email_label']?>:</label>
			<input type="text" id="request-invite-email" class="input-text input-width-300" />
		</p>
		<button id="request-invite" class="button button-primary"><?php echo $cfg['button_label']?></button>
	</form>
</div>
<?php 		
		return ob_get_clean();
	}
}