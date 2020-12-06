<?php

class PluginRndlogo_ActionRndlogo extends Action {
    public function Init() {
        // TODO: Implement Init() method.
    }

    protected function RegisterEvent() {
        $images = Config::Get('plugin.rndlogo.images');

        // 10 retries
        $i = 0;
        while ($i++ < 1) {
            $index = array_rand($images);
            $fullPath = Config::Get('path.rnd-logo.skin').'/'.$images[$index]['filename'];
            if (!$info = getimagesize($fullPath)) {
                continue;
            }

            header('Content-type: ' . $info['mime']);
            header('Content-Transfer-Encoding: binary');
            header('Connection: close');
            readfile($fullPath);
            exit;
        }
    }
}

