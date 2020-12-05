			{hook run='content_end'}
		</div> <!-- /content -->
	</div> <!-- /wrapper -->


	
	<footer id="footer">
		{if $oUserCurrent}
			<ul class="footer-list">
				<li class="footer-list-header word-wrap">{$oUserCurrent->getLogin()}</li>
				<li><a href="{$oUserCurrent->getUserWebPath()}">{$aLang.footer_menu_user_profile}</a></li>
				<li><a href="{router page='settings'}profile/">{$aLang.user_settings}</a></li>
				<li><a href="{router page='topic'}add/" class="js-write-window-show">{$aLang.block_create}</a></li>
				{hook run='footer_menu_user_item' oUser=$oUserCurrent}
				<li><a href="{router page='login'}exit/?security_ls_key={$LIVESTREET_SECURITY_KEY}">{$aLang.exit}</a></li>
			</ul>
		{else}
			<ul class="footer-list">
				<li class="footer-list-header word-wrap">{$aLang.footer_menu_user_quest_title}</li>
				<li><a href="{router page='registration'}" class="js-registration-form-show">{$aLang.registration_submit}</a></li>
				<li><a href="{router page='login'}" class="js-login-form-show sign-in">{$aLang.user_login_submit}</a></li>
				{hook run='footer_menu_user_item' isGuest=true}
			</ul>
		{/if}
		
		<ul class="footer-list">
			<li class="footer-list-header">{$aLang.footer_menu_navigate_title}</li>
			<li><a href="{cfg name='path.root.web'}">{$aLang.topic_title}</a></li>
			<li><a href="{router page='blogs'}">{$aLang.blogs}</a></li>
			<li><a href="{router page='people'}">{$aLang.people}</a></li>
			<li><a href="{router page='stream'}">{$aLang.stream_menu}</a></li>
			{hook run='footer_menu_navigate_item'}
		</ul>
		
		<ul class="footer-list">
			<li class="footer-list-header">Календарь</li>
			<li><a href="{router page='page'}4.html">2015</a></li>
			<li><a href="{router page='page'}287.html">2016</a></li>
			<li><a href="{router page='page'}526.html">2017</a></li>
			<li><a href="{router page='page'}781.html">2018</a></li>
		</ul>
	
		<div class="copyright">
			{hook run='copyright'}
			
			<div class="design-by">
				<img src="{cfg name='path.static.skin'}/images/xeoart.png" alt="xeoart" />
				Design by <a href="http://xeoart.com">xeoart</a>
				<div>2012</div>
			</div>
		</div>
		
		{hook run='footer_end'}
	</footer>
</div> <!-- /container -->

{include file='toolbar.tpl'}

{hook run='body_end'}

{if !defined('DEBUG')}{literal}
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-5151104-5', 'auto');
  ga('send', 'pageview');
</script>
{/literal}{/if}

</body>
</html>