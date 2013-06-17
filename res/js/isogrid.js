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
	var theta = camera.angle*Math.PI/180;
	var rotx = point.x*Math.cos(theta)-point.y*Math.sin(theta);
	var roty = point.x*Math.sin(theta)+point.y*Math.cos(theta);
	return point2D(rotx, roty);
}

function toIso(point, camera) {
	var dilutedPoint = verticalDilute(point, camera.dilution);
	var translatedPoint = translate(dilutedPoint, camera);
	var isox = Math.round(translatedPoint.x);
	var isoy = Math.round(translatedPoint.y);
	return point2D(isox, isoy);
}

function drawGrid(cols, rows, tileSize, canvasId, camera) {
	var docwidth = $(window).width();
	var docheight = $(window).height()-5;
	var canvas = document.getElementById(canvasId);
	$('#' + canvasId).attr("width", docwidth);
	$('#' + canvasId).attr("height", docheight);
	var context = canvas.getContext('2d');
	var width = cols*tileSize;
	var height = rows*tileSize;
	var sqrt3 = Math.sqrt(3);
	var sidelength = tileSize/sqrt3;
	var hexheight = 2*sidelength;
	context.beginPath();
	for (i = 0; i < cols; i++) {
		for (j = 0; j < rows; j++) {
			var xoffset = j % 2 === 1 ? tileSize/2 : 0;
			var point1 = toIso(point2D(xoffset + i*tileSize,
				sidelength/2 + j*3*sidelength/2), camera);
			var point2 = toIso(point2D(xoffset + tileSize/2 + i*tileSize,
				j*3*sidelength/2), camera);
			var point3 = toIso(point2D(xoffset + tileSize + i*tileSize,
				sidelength/2 + j*3*sidelength/2), camera);
			var point4 = toIso(point2D(xoffset + tileSize + i*tileSize,
				3*sidelength/2 + j*3*sidelength/2), camera);
			var point5 = toIso(point2D(xoffset + tileSize/2 + i*tileSize,
				hexheight + j*3*sidelength/2), camera);
			var point6 = toIso(point2D(xoffset + i*tileSize,
				3*sidelength/2 + j*3*sidelength/2), camera);
			context.moveTo(point1.x, point1.y);
			context.lineTo(point2.x, point2.y);
			context.lineTo(point3.x, point3.y);
			context.lineTo(point4.x, point4.y);
			context.lineTo(point5.x, point5.y);
			context.lineTo(point6.x, point6.y);
			context.lineTo(point1.x, point1.y);
		}
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
			tileSize: 32,
			camera: {
				x: 0,
				y: 0,
				angle: 0,
				dilution: 1.4
			}
		};

		// object will contain methods to interact with the grid
		var object = {
			update: function(data) {
				// update
			},
			translate: function(vector) {
				// translate
			},
			redraw: function() {
				drawGrid(settings.cols, settings.rows, settings.tileSize, elid, settings.camera);
			}
		};

		// custom settings
		$.extend(settings, options);

		// creating the canvas
		var el = $(this);
		var elid = $(this).attr('id');
		el.html('<canvas id="game"></canvas>');
		var tileLayer = $('#game');

		// generate grid
		object.redraw();

		// mouse pan handler
		var mouseIsDown = false;
		var mousedownx = 0;
		var mousedowny = 0;
		var mousedowncam = {};
		$(document).mousedown(function(e) {
			mouseIsDown = true;
			el.css('cursor', 'move');
			mousedownx = e.pageX;
			mousedowny = e.pageY;
			mousedowncam = {
				x: settings.camera.x,
				y: settings.camera.y
			};
		});
		$(document).mouseup(function() {
			mouseIsDown = false;
			el.css('cursor', 'default');
		});
		$(document).mousemove(function(e) {
			if (mouseIsDown) {
				var mousex = e.pageX;
				var mousey = e.pageY;
				var newx = mousedowncam.x + mousex - mousedownx;
				var newy = mousedowncam.y + mousey - mousedowny;
				settings.camera.x = newx;
				settings.camera.y = newy;
				object.redraw();
			}
		});

		// resize handler
		$(window).resize(function() {
			object.redraw();
		});

		return object;
	};
});