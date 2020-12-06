<nav id="header" class="clearfix noSwipe">
	<div class="{if $iUserCurrentCountTalkNew}icon-userbar-new-mail{else}icon-userbar{/if} userbar-trigger" id="userbar-trigger"></div>

	<div class="site-name">
        {hook run='header_random_logo'}
	</div>

	{hook run='userbar_nav'}
	
	<ul class="nav-userbar">
		{hook run='userbar_item'}

		{if $oUserCurrent}<div id="next-comment-toolbar"></div>{/if}

		<li class="icon-stream-lg slide-trigger" onclick="$(document).scrollTop(0); ls.tools.slide($('#stream-block'), $(this), true);"></li>
		<li class="icon-news-lg slide-trigger" onclick="$(document).scrollTop(0); ls.tools.slide($('#news-block'), $(this), true);"></li>
		
		<li class="item-search slide-trigger" id="item-search" onclick="$(document).scrollTop(0); ls.tools.slide($('#search'), $(this), true);"></li>
		
		{if !$oUserCurrent}
			<li class="item-auth item-primary slide-trigger" id="item-auth" onclick="$(document).scrollTop(0); ls.tools.slide($('#window_login_form'), $(this), true);"></li>
		{/if}
	</ul>
</nav>