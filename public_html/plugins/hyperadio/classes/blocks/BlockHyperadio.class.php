<?php

class PluginHyperadio_BlockHyperadio extends Block {
    public function Exec() {
        $this->Viewer_Assign('on', false);

        $options = stream_context_create(array('http' =>
            array(
                'timeout' => 2
            )
        ));
        ob_start();
        $data = file_get_contents('http://hyperadio.ru:8000/live.xspf', false, $options);
        ob_end_clean();
        if ($data == false) {
            return;
        }

        $xml = simplexml_load_string($data);
        if ($xml == false) {
            return;
        }

        $title = (string)$xml->trackList->track->title;
        if ($title == "") {
            return;
        }

        $annotation = (string)$xml->trackList->track->annotation;

        if (!preg_match('/Current Listeners: (\d+)/i', $annotation, $matches)) {
            return;
        }
        $currentListeners = $matches[1];

        if (!preg_match('/Peak Listeners: (\d+)/i', $annotation, $matches)) {
            return;
        }
        $peakListeners = $matches[1];

        $this->Viewer_Assign('title', $title);
        $this->Viewer_Assign('currentListeners', $currentListeners);
        $this->Viewer_Assign('peakListeners', $peakListeners);
        $this->Viewer_Assign('on', true);
    }
}
