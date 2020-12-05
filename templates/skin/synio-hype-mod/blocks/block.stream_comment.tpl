{* nyuk: added avatars displaying *}
<style>
	LI.js-title-comment .avatar { float: left; margin-top: 5px; }	
	LI.js-title-comment .avatar-after { margin-left: 30px; }
</style>
<ul class="latest-list">
	{foreach from=$aComments item=oComment name="cmt"}
		{assign var="oUser" value=$oComment->getUser()}
		{assign var="oTopic" value=$oComment->getTarget()}
		
		<li class="js-title-comment" title="{$oComment->getText()|strip_tags|trim|truncate:100:'...'|escape:'html'}">
			<div class="avatar">
				<a href="{$oUser->getUserWebPath()}"><img src="{$oUser->getProfileAvatarPath(24)}" alt="" /></a>
			</div>
			<div class="avatar-after">
				<p>
					<a href="{$oUser->getUserWebPath()}" class="author">{$oUser->getLogin()}</a>
					<time datetime="{date_format date=$oComment->getDate() format='c'}" title="{date_format date=$oComment->getDate() format="j F Y, H:i"}">
						{date_format date=$oComment->getDate() hours_back="12" minutes_back="60" now="60" day="day H:i" format="j F Y, H:i"}
					</time>
				</p>
				
				<a href="{if $oConfig->GetValue('module.comment.nested_per_page')}{router page='comments'}{else}{$oTopic->getUrl()}#comment{/if}{$oComment->getId()}" class="stream-topic">{$oTopic->getTitle()|escape:'html'}</a>
				<span class="block-item-comments"><i class="icon-synio-comments-small"></i>{$oTopic->getCountComment()}{if $oTopic->getCountCommentNew()}<span id="unread-stream" class="comments-new">&nbsp;+{$oTopic->getCountCommentNew()}</span>{/if}</span>
			</div>
		</li>
	{/foreach}
</ul>


<footer>
	<a href="{router page='comments'}">{$aLang.block_stream_comments_all}</a> · <a href="{router page='rss'}allcomments/">RSS</a>
</footer>