{* TESTS 
{assign var="iUserCurrentCountTalkNew" value=1}
*}
<!doctype html>

<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="ru"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="ru"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="ru"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="ru"> <!--<![endif]-->

<head>
	{hook run='html_head_begin'}
	
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	
	<title>{$sHtmlTitle}</title>
	
	<meta name="description" content="{$sHtmlDescription}">
	<meta name="keywords" content="{$sHtmlKeywords}">


	<!-- Mobile viewport optimization h5bp.com/ad -->
	<meta name="HandheldFriendly" content="True">
	<meta name="MobileOptimized" content="320">
	<meta content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=yes" name="viewport">

	<!-- Mobile IE allows us to activate ClearType technology for smoothing fonts for easy reading -->
	<meta http-equiv="cleartype" content="on">


	{$aHtmlHeadFiles.css}
	<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,400italic,600,600italic,700,700italic&subset=latin,cyrillic' rel='stylesheet' type='text/css'>

	<link rel="search" type="application/opensearchdescription+xml" href="{router page='search'}opensearch/" title="{cfg name='view.name'}" />

	<link rel="shortcut icon" href="/favicon.ico" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png"/>
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png"/>
	<link rel="apple-touch-icon" sizes="144x144" href="/favicon/apple-touch-icon-144x144.png"/>
	<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon-180x180.png"/>
	<link rel="image_src" href="/favicon/image_src.png" />
	<link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#777777"/>
	<link rel="manifest" href="/manifest.json">
	<meta name="theme-color" content="#000000">
	<meta name="msapplication-config" content="/browserconfig.xml"/>
	
	{if $aHtmlRssAlternate}
		<link rel="alternate" type="application/rss+xml" href="{$aHtmlRssAlternate.url}" title="{$aHtmlRssAlternate.title}">
	{/if}

	{if $sHtmlCanonical}
		<link rel="canonical" href="{$sHtmlCanonical}" />
	{/if}
	
	{if $bRefreshToHome}
		<meta  HTTP-EQUIV="Refresh" CONTENT="3; URL={cfg name='path.root.web'}/">
	{/if}
	
	
	<script type="text/javascript">
		var DIR_WEB_ROOT 			= '{cfg name="path.root.web"}';
		var DIR_STATIC_SKIN 		= '{cfg name="path.static.skin"}';
		var DIR_ROOT_ENGINE_LIB 	= '{cfg name="path.root.engine_lib"}';
		var LIVESTREET_SECURITY_KEY = '{$LIVESTREET_SECURITY_KEY}';
		var SESSION_ID				= '{$_sPhpSessionId}';
		var BLOG_USE_TINYMCE		= '{cfg name="view.tinymce"}';
		
		var TINYMCE_LANG = 'en';
		{if $oConfig->GetValue('lang.current') == 'russian'}
			TINYMCE_LANG = 'ru';
		{/if}

		var aRouter = new Array();
		{foreach from=$aRouter key=sPage item=sPath}
			aRouter['{$sPage}'] = '{$sPath}';
		{/foreach}
	</script>
	
	
	{$aHtmlHeadFiles.js}

	
	<script type="text/javascript">
		var tinyMCE = false;
		ls.lang.load({json var = $aLangJs});
		ls.registry.set('comment_max_tree','{cfg name="module.comment.max_tree"}');
		ls.lang.load({lang_load name="nav_select_item"});
	</script>
	
	
	{hook run='html_head_end'}
</head>



{if $oUserCurrent}
	{assign var=body_classes value=$body_classes|cat:' ls-user-role-user'}
	
	{if $oUserCurrent->isAdministrator()}
		{assign var=body_classes value=$body_classes|cat:' ls-user-role-admin'}
	{/if}
{else}
	{assign var=body_classes value=$body_classes|cat:' ls-user-role-guest'}
{/if}

{if !$oUserCurrent or ($oUserCurrent and !$oUserCurrent->isAdministrator())}
	{assign var=body_classes value=$body_classes|cat:' ls-user-role-not-admin'}
{/if}


<body class="{$body_classes}">
	{hook run='body_begin'}
	
	{if $oUserCurrent}
		{include file='window_favourite_form_tags.tpl'}
	{/if}
	

	{include file='userbar_menu.tpl'}
	
	<div id="container" class="{hook run='container_class'}">
		{include file='header_top.tpl'}

		<div id="wrapper">
			{if !$oUserCurrent}
				{include file='window_login.tpl'}
			{/if}
			
			<div id="news-block" class="slide">
				{$params = ['plugin' => 'newsblock']}
				{insert name="block" block=newsblock params=$params}
			</div>
			
			<div id="stream-block" class="slide">
				{insert name="block" block=stream}
			</div>
			
			<form action="{router page='search'}topics/" class="slide search-header" id="search">
				<div class="input-holder input-holder-text">
					<input type="text" placeholder="{$aLang.search}" maxlength="255" name="q" class="input-text input-width-full">
				</div>
				<div class="input-holder">
					<button type="submit" class="button button-primary">{$aLang.search_submit}</button>
				</div>
			</form>
			
			
			{hook run='header_banner_begin'}
			{hook run='header_banner_end'}
		
			{include file='nav.tpl'}

			<div id="content" role="main" 
				class="{if $noBg}no-bg{/if} 
				       {if $aPaging and $aPaging.iCountPage > 1 and !$noBg}multipage{/if}
					   {if $sidebarPosition == 'left'}content-right{/if} {hook run='wrapper_class'}"
				{if $sMenuItemSelect=='profile'}itemscope itemtype="http://data-vocabulary.org/Person"{/if}>
				
				{* {include file='nav_content.tpl'} *}
				{include file='system_message.tpl'}
				
				{hook run='content_begin'}