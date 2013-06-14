// "classes"
function point2D(x, y) {
	var result = {};
	result.x = x;
	result.y = y;
	result.z = 0;
	return result;
}

// functions
function translate(point, translation) {
	return point2D(point.x+translation.x, point.y+translation.y);
}

function from3Dto2D(point, camera) {
	var x = point.x;
	var y = point.y;
	return point2D(x, y);
}

function generateGrid(cols, rows, tileSize, canvasId) {
	var canvas = document.getElementById(canvasId);
	var context = canvas.getContext('2d');
	var width = cols*tileSize;
	var height = rows*tileSize;
	var sqrt3 = Math.sqrt(3);
	var hexwidth = 2*tileSize/sqrt3;
	var hexheight = tileSize;
	var xdist = tileSize/sqrt3+hexwidth;
	var camera = {
		x: 2,
		y: 0,
		z: 2,
		width: 4,
		height: 4
	};
	camera.x *= tileSize;
	camera.y *= tileSize;
	camera.z *= tileSize;
	camera.width *= tileSize;
	camera.height *= tileSize;
	context.beginPath();
	for (i = 0; i <= cols; i++) {
		from = from3Dto2D(point2D(i*tileSize, 0), camera);
		to = from3Dto2D(point2D(i*tileSize, height), camera);
		context.moveTo(from.x, from.y);
		context.lineTo(to.x, to.y);
	}
	for (i = 0; i <= rows; i++) {
		from = from3Dto2D(point2D(0, i*tileSize), camera);
		to = from3Dto2D(point2D(width, i*tileSize), camera);
		context.moveTo(from.x, from.y);
		context.lineTo(to.x, to.y);
	}
	// for (i = 0; i < cols; i++) {
	// 	for (j = 0; j < rows; j++) {
	// 		var xoffset = j % 2 === 1 ? 3*tileSize/(2*sqrt3) : 0;
	// 		point1 = from3Dto2D(point2D(i*xdist+xoffset,
	// 			tileSize/2+j*tileSize/2), camera);
	// 		point2 = from3Dto2D(point2D(tileSize/(2*sqrt3)+i*xdist+xoffset,
	// 			0+j*tileSize/2), camera);
	// 		point3 = from3Dto2D(point2D(tileSize/(2*sqrt3)+i*xdist+xoffset+tileSize/sqrt3,
	// 			0+j*tileSize/2), camera);
	// 		point4 = from3Dto2D(point2D(hexwidth+i*xdist+xoffset,
	// 			tileSize/2+j*tileSize/2), camera);
	// 		point5 = from3Dto2D(point2D(tileSize/(2*sqrt3)+i*xdist+xoffset+tileSize/sqrt3,
	// 			tileSize+j*tileSize/2), camera);
	// 		point6 = from3Dto2D(point2D(tileSize/(2*sqrt3)+i*xdist+xoffset,
	// 			tileSize+j*tileSize/2), camera);
	// 		context.moveTo(point1.x, point1.y);
	// 		context.lineTo(point2.x, point2.y);
	// 		context.lineTo(point3.x, point3.y);
	// 		context.lineTo(point4.x, point4.y);
	// 		context.lineTo(point5.x, point5.y);
	// 		context.lineTo(point6.x, point6.y);
	// 		context.lineTo(point1.x, point1.y);
	// 	}
	// }
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
			tileSize: 32
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