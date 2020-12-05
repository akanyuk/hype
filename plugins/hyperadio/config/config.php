<?php

Config::Set('block.rule_hyperadio', array(
    'action' => array(
        'index',
        'blog' => array('{topics}', '{topic}', '{blog}')
    ),
    'blocks' => array(
        'right' => array(
            'hyperadio' => array(
                'params' => array('plugin' => 'hyperadio'),
                'priority' => 100,
            ),
        )
    ),
));
