<?php
class PluginNewsblock_BlockNewsblock extends Block {


	public function Exec() {
		if (!$blog = $this->Blog_GetBlogByUrl(Config::Get('plugin.newsblock.blog_url'))) {
			return false;
		}

		if (!$topics = $this->Topic_GetTopicsByFilter(
			array(
				'blog_id'       => $blog->getId(),
				'blog_type'     => array('open'),
				'topic_publish' => 1,
				'topic_rating'  => array(
					'value' => Config::Get('plugin.newsblock.sidebar_good'),
					'type'  => 'top',
					'publish_index'  => 1,
				)
			),
			1,
			Config::Get('plugin.newsblock.topics_count'),
			array(
				'user' => array(),
				'blog' => array('owner' => array())
			))
		) {
			return false;
		}

		// Set 'unread' state
		$oUserCurrent = $this->User_getUserCurrent();
		
		$t = reset($topics['collection']);
		$news_topics = array();
		foreach ($topics['collection'] as $t) {
			if ($oUserCurrent) {	
				$t->unread = $this->Topic_GetTopicRead($t->getId(), $oUserCurrent->getId()) ? false : true;
			}
			else {
				$t->unread = false;
			}
			
			$news_topics[] = $t;
		}

		$this->Viewer_Assign('news_blog', $blog);
		$this->Viewer_Assign('news_topics', $news_topics);
	}

}