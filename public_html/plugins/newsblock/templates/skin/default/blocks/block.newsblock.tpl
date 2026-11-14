{if $news_topics}<div class="block block-type-stream">
	<header class="block-header sep">
		<h3>{$oConfig->GetValue('plugin.newsblock.header')}</h3>
	</header>
	
	<div class="block-content">
		<ul class="latest-list">{foreach $news_topics as $topic}
			{assign var="oUser" value=$topic->getUser()}
	
			<li class="js-title-comment{if $topic->unread} unread{/if}" title="{$topic->getText()|strip_tags|trim|truncate:100:'...'|escape:'html'}">
				<a href="{$topic->getUrl()}" class="stream-topic">{$topic->getTitle()|escape:'html'}</a>
				<p>
					<a href="{$oUser->getUserWebPath()}" class="author">{$oUser->getLogin()}</a>
					<time datetime="{date_format date=$topic->getDateAdd() format='c'}" title="{date_format date=$topic->getDateAdd() format="j F Y, H:i"}">
						{date_format date=$topic->getDateAdd() hours_back="12" minutes_back="60" now="60" day="day H:i" format="j F Y, H:i"}
					</time>
					
					<span class="block-item-comments"><i class="icon-synio-comments-small"></i>{$topic->getCountComment()}</span>
				</p>
			</li>
		{/foreach}</ul>
			
		<footer>
			<a href="{router page='blog'}{$news_blog->getUrl()}">{$oConfig->GetValue('plugin.newsblock.all_news')}</a> · <a href="{router page='rss'}blog/{$oConfig->GetValue('plugin.newsblock.blog_url')}/">RSS</a>
		</footer>			
		
	</div>
</div>{/if}
