{assign var="noSidebar" value=true}
{include file='header.tpl'}

{assign var="oUser" value=$oTopic->getUser()}
<article class="topic topic-type-{$oTopic->getType()} js-topic">
	<header class="topic-header">
		<h1 class="topic-title word-wrap">{$oTopic->getTitle()|escape:'html'}</h1>
	</header>
	
	<div class="topic-content text">
		{$oTopic->getText()}
	</div>
	
	<footer class="topic-footer">
		<ul class="topic-info">
			<li class="topic-info-author">
				<a href="{$oUser->getUserWebPath()}"><img src="{$oUser->getProfileAvatarPath(24)}" alt="avatar" class="avatar" /></a>
				<a rel="author" href="{$oUser->getUserWebPath()}">{$oUser->getLogin()}</a>
			</li>
			<li class="topic-info-date">
				<time datetime="{date_format date=$oTopic->getDateAdd() format='c'}" title="{date_format date=$oTopic->getDateAdd() format='j F Y, H:i'}">
					{date_format date=$oTopic->getDateAdd() hours_back="12" minutes_back="60" now="60" day="day H:i" format="j F Y, H:i"}
				</time>
			</li>
		</ul>

		<br />
		<br />
		<h4 class="reply-header">
			<a href="{$oTopic->getUrl()}" class="link-dotted">{$aPluginLang.goto_topic}</a>
		</h4>		
	</footer>
	
	
</article> <!-- /.topic -->	


{include file='footer.tpl'}
