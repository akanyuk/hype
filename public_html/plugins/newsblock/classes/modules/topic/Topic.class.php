<?php

class PluginNewsblock_ModuleTopic extends PluginNewsblock_Inherit_ModuleTopic {
    protected $oMapper;

    public function Init() {
        parent::Init();
        $this->oMapper = Engine::GetMapper(__CLASS__);
    }

    /**
     * Запрашиваем топики на главную страницу. Исключаем блог "Новости"
     * */
	public function GetTopicsGood($iPage,$iPerPage,$bAddAccessible=true) {
		$aFilter = array(
			'blog_type' => array(
				'personal',
				'open'
			),
			'topic_publish' => 1,
			'topic_rating'  => array(
				'value' => Config::Get('module.blog.index_good'),
				'type'  => 'top',
				'publish_index'  => 1,
			)
		);
		
		if ($blog = $this->Blog_GetBlogByUrl(Config::Get('plugin.newsblock.blog_url'))) {
			$aFilter['blog_exclude'] = $blog->getId();
		}
		
		 //Если пользователь авторизирован, то добавляем в выдачу закрытые блоги в которых он состоит
		if($this->oUserCurrent && $bAddAccessible) {
			$aOpenBlogs = $this->Blog_GetAccessibleBlogsByUser($this->oUserCurrent);
			if(count($aOpenBlogs)) $aFilter['blog_type']['close'] = $aOpenBlogs;
		}

		return $this->GetTopicsByFilter($aFilter,$iPage,$iPerPage);
	}
}