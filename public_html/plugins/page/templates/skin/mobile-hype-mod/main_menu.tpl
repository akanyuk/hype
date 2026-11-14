{foreach from=$aPagesMain item=oPage}
	<li {if $sAction=='page' and $oPage.event == $sEvent}class="active"{/if}>
		<a href="{cfg name='path.root.web'}/page/{$oPage.event}">
			<div class="holder"><i class="{$oPage.mobile_icon_class}"></i></div>
			{$oPage.desc}
		</a>
	</li>
{/foreach}