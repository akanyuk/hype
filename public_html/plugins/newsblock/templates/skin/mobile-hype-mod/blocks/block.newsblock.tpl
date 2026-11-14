{if $news_topics}<section class="block block-type-stream">
	<header class="block-header">
		<h3><a href="{router page='blog'}{$news_blog->getUrl()}" title="{$oConfig->GetValue('plugin.newsblock.all_news')}">{$oConfig->GetValue('plugin.newsblock.header')}</a></h3>
	</header>
	
	<div class="block-content">
		<ul class="item-list">{foreach $news_topics as $topic}
			{assign var="oUser" value=$topic->getUser()}
	
			<li {if $topic->unread}id="unread-news"{/if} class="news{if $topic->unread} unread{/if}" title="{$topic->getText()|strip_tags|trim|truncate:100:'...'|escape:'html'}">
				<a href="{$topic->getUrl()}" class="topic-name">{$topic->getTitle()|escape:'html'}</a>
				<p>
					<a href="{$oUser->getUserWebPath()}" class="author">{$oUser->getLogin()}</a>
					<time datetime="{date_format date=$topic->getDateAdd() format='c'}" title="{date_format date=$topic->getDateAdd() format="j F Y, H:i"}">
						{date_format date=$topic->getDateAdd() hours_back="12" minutes_back="60" now="60" day="day H:i" format="j F Y, H:i"}
					</time> | {$topic->getCountComment()} {$topic->getCountComment()|declension:$aLang.comment_declension:'russian'}
				</p>
			</li>
		{/foreach}</ul>
			
		<footer>
			<a href="{router page='blog'}{$news_blog->getUrl()}">{$oConfig->GetValue('plugin.newsblock.all_news')}</a> · <a href="{router page='rss'}blog/{$oConfig->GetValue('plugin.newsblock.blog_url')}/">RSS</a>
		</footer>			
		
	</div>
</section>{/if}
