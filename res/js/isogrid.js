jQuery(function($){
	$.fn.isogrid = function(options) {
		var settings = {
			rows: 10,
			cols: 10,
			tilesize: 32
		};
		$.extend(settings, options);
		
		var el = $(this);
		el.html('');
		el.append('<canvas id="tilelayer"></canvas>');
		el.append('<canvas id="uilayer"></canvas>');
		var tileLayer = $('#tilelayer');
		var uiLayer = $('#uilayer');
	}
});