// "classes"
function point2D(x, y) {
	var result = {};
	result.x = x;
	result.y = y;
	return result;
}

// functions
function translate(point, translation) {
	return point2D(point.x+translation.x, point.y+translation.y);
}

function verticalDilute(point, dilution) {
	return point2D(point.x, point.y/dilution);
}

function rotateUsingCamera(point, camera) {
	var step1 = translate(point, point2D(-1*camera.x, -1*camera.y));
	var theta = camera.angle*Math.PI/180;
	var rotx = step1.x*Math.cos(theta)-step1.y*Math.sin(theta);
	var roty = step1.x*Math.sin(theta)+step1.y*Math.cos(theta);
	var step2 = point2D(rotx, roty);
	var step3 = translate(step2, camera);
	return step2;
}

function toIso(point, camera) {
	var rotatedPoint = rotateUsingCamera(point, camera);
	var dilutedPoint = verticalDilute(rotatedPoint, 2.5);
	var isox = dilutedPoint.x;
	var isoy = dilutedPoint.y;
	return point2D(isox, isoy);
}

function generateGrid(cols, rows, tileSize, canvasId) {
	var canvas = document.getElementById(canvasId);
	var context = canvas.getContext('2d');
	var width = cols*tileSize;
	var height = rows*tileSize;
	var camera = {
		x: -10,
		y: 10,
		angle: 45
	};
	camera.x *= tileSize;
	camera.y *= tileSize;
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