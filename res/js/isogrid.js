// "classes"
function point2D(x, y) {
	var result = {};
	result.x = x;
	result.y = y;
	return result;
}

// functions
function toIso(point, camera) {
	var isox = point.x;
	var isoy = point.y;
	return point2D(isox, isoy);
}

function generateGrid(cols, rows, tileSize, canvasId) {
	var canvas = document.getElementById(canvasId);
	var context = canvas.getContext('2d');
	var width = cols*tileSize;
	var height = rows*tileSize;
	var camera = {};
	context.beginPath();
	for (i = 0; i <= cols; i++) {
		from = toIso(point2D(i*tileSize, 0), camera);
		to = toIso(point2D(i*tileSize, height), camera);
		context.moveTo(from.x, from.y);
		context.lineTo(to.x, to.y);
	}
	for (i = 0; i <= rows; i++) {
		from = toIso(point2D(0, i*tileSize), camera);
		to = toIso(point2D(width, i*tileSize), camera);
		context.moveTo(from.x, from.y);
		context.lineTo(to.x, to.y);
	}
	context.closePath();
	context.stroke();
}


// $.fn.isogrid implementation
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