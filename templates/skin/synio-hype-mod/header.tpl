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

	{$aHtmlHeadFiles.css}
	
	<link href='https://fonts.googleapis.com/css?family=PT+Sans:400,700&subset=latin,cyrillic' rel='stylesheet' type='text/css'>

	
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

	<meta property="og:image" content="https://hype.retroscene.org/favicon/apple-touch-icon-180x180.png">
	{if $aHtmlRssAlternate}
	<meta property="og:description" content="{$aHtmlRssAlternate.title}">
	{/if}

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
		ls.registry.set('comment_max_tree',{json var=$oConfig->Get('module.comment.max_tree')});
		ls.registry.set('block_stream_show_tip',{json var=$oConfig->Get('block.stream.show_tip')});
	</script>
	
	
	{if {cfg name='view.grid.type'} == 'fluid'}
		<style>
			#container {
				min-width: {cfg name='view.grid.fluid_min_width'}px;
				max-width: {cfg name='view.grid.fluid_max_width'}px;
			}
		</style>
	{else}
		<style>
			#container {
				width: {cfg name='view.grid.fixed_width'}px;
			}
		</style>
	{/if}
	
	
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

{add_block group='toolbar' name='toolbar_admin.tpl' priority=100}
{add_block group='toolbar' name='toolbar_scrollup.tpl' priority=-100}

<body class="{$body_classes} width-{cfg name='view.grid.type'}">
	{hook run='body_begin'}
	
	
	{if $oUserCurrent}
		{include file='window_write.tpl'}
		{include file='window_favourite_form_tags.tpl'}
	{else}
		{include file='window_login.tpl'}
	{/if}
	


	
	<div id="header-back"></div>
	
	<div id="container" class="{hook run='container_class'}">
		{include file='header_top.tpl'}
		{include file='nav.tpl'}

		<div id="wrapper" class="{if $noSidebar}no-sidebar{/if}{hook run='wrapper_class'}">
			{if !$noSidebar}
				{include file='sidebar.tpl'}
			{/if}
		
			<div id="content" role="main" {if $sidebarPosition == 'left'}class="content-profile"{/if} {if $sMenuItemSelect=='profile'}itemscope itemtype="http://data-vocabulary.org/Person"{/if}>
				{include file='nav_content.tpl'}
				{include file='system_message.tpl'}
				
				{hook run='content_begin'}
