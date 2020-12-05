<?php

class PluginNewsblock_ModuleTopic_MapperTopic extends PluginNewsblock_Inherit_ModuleTopic_MapperTopic {
	protected function buildFilter($aFilter) {
        $sWhere = parent::buildFilter($aFilter);
        
		if (isset($aFilter['blog_exclude'])) {
			
			$sWhere .= is_array($aFilter['blog_exclude'])
				? ' AND t.blog_id NOT IN ('.implode(', ',$aFilter['blog_exclude']).')'
				: ' AND t.blog_id != '.(int)$aFilter['blog_exclude'];
		}

        return $sWhere;
	}
}
