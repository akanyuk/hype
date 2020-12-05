<script type="text/javascript">
	$(document).ready(function(){
		setInterval(updateHypeRadioInfo, 100000);
		updateHypeRadioInfo();
		
		function updateHypeRadioInfo() { 
			$.get('http://hyperadio.ru:8000/live.xspf', function(response){
				var annotation = $(response).find("annotation").text();
				var current = annotation.match(/Current Listeners: (\d+)/i)[1];
				var peak = annotation.match(/Peak Listeners: (\d+)/i)[1];
	
				$('div[id="hype-radio-off"]').hide();
				$('div[id="hype-radio-info"]').find('#track').text($(response).find("title").text());
				$('div[id="hype-radio-info"]').find('#current').text(current);
				$('div[id="hype-radio-info"]').find('#peak').text(peak);
				$('div[id="hype-radio-info"]').show();
				
			}, 'xml');
		}
	});
</script>
<style>
	.hype-radio .inner { padding-top: 20px; }
	.hype-radio .description { padding-top: 20px; }
	
	#hype-radio-info { 
		display: none;
		background-color: #eee;
		border: 1px solid #ccc;
		border-radius: 5px;
		display: none;
		font-size: 90%;
		line-height: 1.3em;
		padding: 5px;		 
		-webkit-box-shadow: 1px 1px 8px 0px rgba(50, 50, 50, 0.3);
		-moz-box-shadow:    1px 1px 8px 0px rgba(50, 50, 50, 0.3);
		box-shadow:         1px 1px 8px 0px rgba(50, 50, 50, 0.3);	
	}

	#hype-radio-info #track { font-weight: bold; }
	#hype-radio-info #current { font-weight: bold; font-size: 150%; }
	#hype-radio-info hr { color: #ccc; border-color: #ccc; border-image: none; border-width: 1px 0 0; }
	
</style>
<div class="block block-type-blogs">
	<header class="block-header sep">
		<h3><a href="https://hyperadio.retroscene.org">Hyperadio</a></h3>
	</header>
	<div class="block-content hype-radio">
		<div align="center" class="inner">
			<div id="hype-radio-off">
				<a href="http://hyperadio.retroscene.org" title="HYPERADIO"><img src="{cfg name='path.static.skin'}/images/hyperadio-icon.gif" /></a>
			</div>
			<div id="hype-radio-info">
				<div style="float: left; margin-right:5px;">
					<a href="http://hyperadio.retroscene.org" title="HYPERADIO"><img src="{cfg name='path.static.skin'}/images/hyperadio-icon.gif" /></a>
				</div>
				<div>
					<div id="track"></div>
					<hr />
					<div>listeners: <span id="current"></span> (<span id="peak"></span> peak)</div>
				</div>
				<div style="clear: both;"></div>					
			</div>
			<div class="description">
				{* <p>Ежедневно с 6:30 до 00:00 Msk (плюс-минус обстоятельства)</p><br> *}
				<a href="http://hyperadio.ru:8000/live.m3u" rel="nofollow">M3U</a>
				<a href="http://hyperadio.ru:8000/live.xspf" rel="nofollow">XSPF</a>
				<a href="http://hyperadio.ru:8000/live.vclt" rel="nofollow">VCLT</a>
			</div>			 
		</div>
	</div>
</div>