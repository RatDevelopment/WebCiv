jQuery(function($){
	$.fn.isogrid = function(options) {
		// settings
		var settings = {
			rows: 10,
			cols: 10,
			tilesize: 32
		};
		// custom settings
		$.extend(settings, options);

		// creating the canvas
		var el = $(this);
		el.html('<canvas id="tilelayer"></canvas>');
		var tileLayer = $('#tilelayer');

		// object will contain methods to interact with the grid
		var object = {
			update: function(data) {
				// update
			},
			translate: function(vector) {
				// translate
			}
		};

		return object;
	};
});