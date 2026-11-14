<style>
    .hype-radio .inner {
        padding-top: 20px;
    }

    .hype-radio .description {
        padding-top: 20px;
    }

    .hype-radio-info {
        background-color: #eee;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 90%;
        line-height: 1.3em;
        padding: 5px;
        box-shadow: 1px 1px 8px 0px rgba(50, 50, 50, 0.3);
    }

    .hype-radio-info .title {
        font-weight: bold;
    }

    .hype-radio-info .current {
        font-weight: bold;
        font-size: 150%;
    }

    .hype-radio-info hr {
        color: #ccc;
        border-color: #ccc;
        border-image: none;
        border-width: 1px 0 0;
    }
</style>
<div class="block block-type-blogs">
    <header class="block-header sep">
        <h3><a href="https://stream.hyperadio.ru">Hyperadio</a></h3>
    </header>
    <div class="block-content hype-radio">
        <div style="text-align:center" class="inner">
            {if $on}
            <div class="hype-radio-info">
                <div style="float: left; margin-right:5px;">
                    <a href="http://hyperadio.retroscene.org" title="HYPERADIO"><img
                                src="{cfg name='path.static.skin'}/images/hyperadio-icon.gif"/></a>
                </div>
                <div>
                    <div class="title">{$title}</div>
                    <hr/>
                    <div>listeners: <span class="current">{$currentListeners}</span> ({$peakListeners} peak)</div>
                </div>
                <div style="clear: both;"></div>
            </div>
            {else}
            <a href="http://hyperadio.retroscene.org" title="HYPERADIO"><img
                        src="{cfg name='path.static.skin'}/images/hyperadio-icon.gif"/></a>
            {/if}
            <div class="description">
                <a href="http://hyperadio.ru:8000/live.m3u" rel="nofollow">M3U</a>
                <a href="http://hyperadio.ru:8000/live.xspf" rel="nofollow">XSPF</a>
                <a href="http://hyperadio.ru:8000/live.vclt" rel="nofollow">VCLT</a>
            </div>
        </div>
    </div>
</div>