{* Theme and font size toggles. $tag='li' renders list items for the mobile header, otherwise a wrapper block *}
{capture name=display_toggles}
	<button type="button" class="display-toggle display-toggle-theme" data-display-toggle="theme" aria-pressed="false"
		data-label-on="{$aLang.display_theme_light}" data-label-off="{$aLang.display_theme_dark}"
		title="{$aLang.display_theme_dark}" aria-label="{$aLang.display_theme_dark}">
		<svg class="display-icon-moon" viewBox="0 0 16 16" aria-hidden="true"><path d="M14.5 10.2A6.5 6.5 0 0 1 5.8 1.5a6.5 6.5 0 1 0 8.7 8.7z"/></svg>
		<svg class="display-icon-sun" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2"/><path d="M7.25 0h1.5v2.5h-1.5zM7.25 13.5h1.5V16h-1.5zM0 7.25h2.5v1.5H0zM13.5 7.25H16v1.5h-2.5zM2.1 3.17l1.07-1.07 1.77 1.77-1.07 1.07zM11.06 12.13l1.07-1.07 1.77 1.77-1.07 1.07zM2.1 12.83l1.77-1.77 1.07 1.07-1.77 1.77zM11.06 3.87l1.77-1.77 1.07 1.07-1.77 1.77z"/></svg>
	</button>
{/capture}
{capture name=display_font}
	<button type="button" class="display-toggle display-toggle-font" data-display-toggle="font" aria-pressed="false"
		data-label-on="{$aLang.display_font_normal}" data-label-off="{$aLang.display_font_large}"
		title="{$aLang.display_font_large}" aria-label="{$aLang.display_font_large}">A</button>
{/capture}
{if $tag == 'li'}
	<li class="display-toggle-item">{$smarty.capture.display_toggles}</li>
	<li class="display-toggle-item">{$smarty.capture.display_font}</li>
{else}
	<div id="display-settings" class="display-settings {if $oUserCurrent}is-user{else}is-guest{/if}">
		{$smarty.capture.display_toggles}
		{$smarty.capture.display_font}
	</div>
{/if}
