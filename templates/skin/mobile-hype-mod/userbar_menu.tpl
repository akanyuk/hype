<aside id="userbar" class="userbar-menu">
	<div class="userbar-menu-inner" id="userbar-inner">
		{if $oUserCurrent}
			<div class="userbar-menu-user">
				<a href="#" onclick="jQuery('#userbar-personal-menu').slideToggle(); return false;"><img src="{$oUserCurrent->getProfileAvatarPath(48)}" alt="avatar" class="avatar" /></a>
				<h3 class="login"><a href="#" onclick="jQuery('#userbar-personal-menu').slideToggle(); return false;">{$oUserCurrent->getLogin()}</a></h3>
			</div>
			
			<a href="#" onclick="jQuery('#userbar-personal-menu').slideToggle(); return false;">
				<div class="userbar-menu-rating-wrapper">
					<span class="user-profile-rating"><i class="icon-rating-grey"></i> {$oUserCurrent->getRating()}</span>
					<span class="user-profile-rating user-profile-strength"><i class="icon-strength"></i> {$oUserCurrent->getSkill()}</span>
					{if $iUserCurrentCountTalkNew}<span class="user-profile-rating user-profile-new-mail"><i class="icon-new-mail"></i> +{$iUserCurrentCountTalkNew}</span>{/if}
				</div>
			</a>
	
			<ul class="userbar-submit-menu" id="userbar-personal-menu">
				<li class="{if $sAction=='profile' && ($aParams[0]=='whois' or $aParams[0]=='')}active{/if}">
					<a href="{$oUserCurrent->getUserWebPath()}"><i class="icon-profile-profile-white"></i>{$aLang.user_menu_profile_whois}</a>
				</li>
				<li class="userbar-item-messages {if $sAction=='talk'}active{/if}">
					<a href="{router page='talk'}"><i class="icon-profile-messages-white"></i>{$aLang.talk_menu_inbox}</a>
					{if $iUserCurrentCountTalkNew} 
						<a href="{router page='talk'}inbox/new" class="userbar-item-messages-number">+{$iUserCurrentCountTalkNew}</a>
					{/if}
				</li>
				<li class="{if $sAction=='profile' && $aParams[0]=='favourites'}active{/if}">
					<a href="{$oUserCurrent->getUserWebPath()}favourites/topics/"><i class="icon-profile-favourites-white"></i>{$aLang.user_menu_profile_favourites}{if ($iCountFavouriteUserCurrent)>0} ({$iCountFavouriteUserCurrent}){/if}</a>
				</li>
				<li class="{if $sAction=='profile' && $aParams[0]=='wall'}active{/if}">
					<a href="{$oUserCurrent->getUserWebPath()}wall/"><i class="icon-profile-wall-white"></i>{$aLang.user_menu_profile_wall}{if ($iCountWallUserCurrent)>0} ({$iCountWallUserCurrent}){/if}</a>
				</li>
				<li class="{if $sAction=='profile' && $aParams[0]=='created'}active{/if}">
					<a href="{$oUserCurrent->getUserWebPath()}created/topics/"><i class="icon-profile-submited-white"></i>{$aLang.user_menu_publication}{if ($iCountCreatedUserCurrent)>0} ({$iCountCreatedUserCurrent}){/if}</a>
				</li>
				<li class="{if $sAction=='profile' && $aParams[0]=='friends'}active{/if}">
					<a href="{$oUserCurrent->getUserWebPath()}friends/"><i class="icon-profile-friends-white"></i>{$aLang.user_menu_profile_friends}{if ($iCountFriendsUserCurrent)>0} ({$iCountFriendsUserCurrent}){/if}</a>
				</li>
				<li class="{if $sAction=='profile' && $aParams[0]=='stream'}active{/if}">
					<a href="{$oUserCurrent->getUserWebPath()}stream/"><i class="icon-profile-activity-white"></i>{$aLang.user_menu_profile_stream}</a>
				</li>
				<li class="{if $sAction=='settings'}active{/if}">
					<a href="{router page='settings'}"><i class="icon-profile-settings-white"></i>{$aLang.settings_menu}</a>
				</li>
				<li class="noicon"><a href="{router page='login'}exit/?security_ls_key={$LIVESTREET_SECURITY_KEY}">{$aLang.exit}</a></li>
			</ul>
		{/if}

		<ul class="userbar-menu-items">
			<li class="{if $sMenuItemSelect == 'blog' && $oBlog && $oBlog->getUrl() == 'news'}active{/if}"><div class="holder"><i class="icon-news-white"></i></div><a href="{router page='blog'}news">{$oConfig->GetValue('plugin.newsblock.header')}</a></li>
			<li class="{if $sMenuHeadItemSelect=='blogs'}active{/if}"><a href="{router page='blogs'}"><div class="holder"><i class="icon-blog-white"></i></div>{$aLang.blogs}</a></li>
			<li class="{if $sMenuHeadItemSelect=='people'}active{/if}"><a href="{router page='people'}"><div class="holder"><i class="icon-profile-friends-white"></i></div>{$aLang.people}</a></li>
			<li class="{if $sMenuHeadItemSelect=='stream'}active{/if}"><a href="{router page='stream'}all"><div class="holder"><i class="icon-profile-activity-white"></i></div>{$aLang.stream_menu}</a></li>

			{hook run='main_menu_item'}
			
			{if $oUserCurrent}
				<li class="userbar-item" {if $sAction=='profile' && ($aParams[0]=='whois' or $aParams[0]=='')}class="active"{/if}>
					<a href="#" onclick="jQuery('#userbar-submit-menu').slideToggle(); return false;"><div class="holder"><i class="icon-profile-submit-white"></i></div>{$aLang.block_create}</a>
				</li>
				
				<ul class="userbar-submit-menu" id="userbar-submit-menu">
					{if $iUserCurrentCountTopicDraft}
						<li class="write-item-type-draft">
							<i class="icon-submit-topic-userbar"></i>
							<a href="{router page='topic'}saved/" class="write-item-link">{$aLang.topic_menu_saved} ({$iUserCurrentCountTopicDraft})</a>
						</li>
					{/if}
					<li class="write-item-type-topic">
						<i class="icon-submit-topic-userbar"></i>
						<a href="{router page='topic'}add" class="write-item-link">{$aLang.block_create_topic_topic}</a>
					</li>
					<li class="write-item-type-blog">
						<i class="icon-submit-blog-userbar"></i>
						<a href="{router page='blog'}add" class="write-item-link">{$aLang.block_create_blog}</a>
					</li>
					<li class="write-item-type-message">
						<i class="icon-submit-message-userbar"></i>
						<a href="{router page='talk'}add" class="write-item-link">{$aLang.block_create_talk}</a>
					</li>
					{hook run='write_item'}
				</ul>
			{/if}
		</ul>

		<ul class="userbar-menu-items">
			<li><a href="{cfg name='path.root.web'}?force-mobile=off">{$aLang.desktop_version}</a></li>
		</ul>		
	</div>
</aside>