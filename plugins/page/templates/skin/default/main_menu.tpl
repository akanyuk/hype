{foreach from=$aPagesMain item=oPage}
	<li {if $sAction=='page' and $oPage.event == $sEvent}class="active"{/if}><a href="{cfg name='path.root.web'}page/{$oPage.event}" >{$oPage.desc}</a><i></i></li>
{/foreach}