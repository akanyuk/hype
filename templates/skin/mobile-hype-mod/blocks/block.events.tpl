<script type="text/javascript">
$(document).ready(function(){
	$('#block-events-content').html('<p style="font-size: 11px; color: #818189;">Loading active events...</p>');
	
	$.get('https://events.retroscene.org/api/events/upcoming-current', function(response){
		if (!$(response).find('Event').length) {
			$('#block-events').remove();
			return;
		}

		$('#block-events-content').empty();
		
		$.each($(response).find('Event'), function(){
	 	 	var tpl = $('div[id="events-item-template"]').html();
	 	 	tpl = tpl.replace(/%title%/g, $(this).find('Title').text());
	 	 	tpl = tpl.replace(/%url%/g, $(this).find('URL').text());
	 	 	tpl = tpl.replace(/%logo-img%/g, '<img src="' + $(this).find('Logo').text() + '"/>');

	 	 	// Format event date
		    var df = new Date($(this).find('DateFrom').text() * 1000);
		    
		    var day = df.getDate();
		    day = day < 10 ? '0' + day : day;
		
		    var month = df.getMonth() + 1;
		    month = month < 10 ? '0' + month : month;
		    
		    var fromStr = day + '.' + month + '.' + df.getFullYear();
		
		    var dt = new Date($(this).find('DateTo').text() * 1000);
		    
		    day = dt.getDate();
		    day = day < 10 ? '0' + day : day;
		    
		    month = dt.getMonth() + 1;
		    month = month < 10 ? '0' + month : month;
		
		    var toStr = day + '.' + month + '.' + dt.getFullYear();
		    
	 	 	tpl = tpl.replace(/%date%/g, fromStr == toStr ? fromStr : fromStr + ' - ' + toStr);
	 	 	
	 	 	$('#block-events-content').append(tpl);
		});
		
	}, 'xml');
});
</script>
<style>
	#block-events-content IMG { width: 32px; height: 32px; }
</style>
<div id="events-item-template" style="display: none;">
	<div style="float: left; width: 40px; padding-top: 3px;">
		<a href="%url%">%logo-img%</a>
	</div>
	<div>
		<a href="%url%"><strong>%title%</strong></a>
		<p style="font-size: 11px; color: #818189;">%date%</p>				
	</div>
	<div style="clear: both; padding-bottom: 15px;"></div>
</div>

<div class="block">
	<header class="block-header sep">
		<h3><a href="https://events.retroscene.org">
			<img src="{cfg name='path.static.skin'}/images/events-icon-16x16px.png" style="position: relative; top: 2px;"/>
			events
		</a></h3>
	</header>
	<div class="block-content">
		<div id="block-events-content" class="inner"></div>
	</div>
</div>