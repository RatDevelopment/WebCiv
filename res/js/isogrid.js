// "classes"
function point2D(x, y) {
	var result = {};
	result.x = x;
	result.y = y;
	return result;
}

function sprite(src) {
	var img = new Image();
	img.src = 'res/img/' + src;
	return img;
}

// sprites
var sprites = {
	ground: sprite('ground.png'),
	water: sprite('water.png')
};

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

function drawGrid(map, tileSize, canvasId, camera) {
	var docwidth = $(window).width();
	var docheight = $(window).height()-5;
	var canvas = document.getElementById(canvasId);
	$('#' + canvasId).attr("width", docwidth);
	$('#' + canvasId).attr("height", docheight);
	var context = canvas.getContext('2d');
	var sidelength = tileSize/Math.sqrt(3);
	for (var index in map) {
		var tile = map[index];
		var xoffset = tile.y % 2 === 1 ? tileSize/2 : 0;
		var spritePoint = toIso(point2D(xoffset + tile.x*tileSize,
			tile.y*3*sidelength/2), camera);
		context.drawImage(sprites[tile.type], spritePoint.x, spritePoint.y);
	}
}

// $.fn.isogrid implementation
jQuery(function($){
	$.fn.isogrid = function(options) {
		// settings
		var settings = {
			map: {},
			tileSize: 128,
			camera: {
				x: 0,
				y: 0,
				angle: 0,
				dilution: 1.4
			}
		};

		function init() {
			// generate grid
			object.redraw();
		}

		sprites.ground.onload = init;

		// object will contain methods to interact with the grid
		var object = {
			update: function(data) {
				// update
			},
			translate: function(vector) {
				// translate
			},
			redraw: function() {
				drawGrid(settings.map, settings.tileSize, elid, settings.camera);
			}
		};

		// custom settings
		$.extend(settings, options);

		// creating the canvas
		var el = $(this);
		var elid = $(this).attr('id');
		el.html('<canvas id="game"></canvas>');
		var tileLayer = $('#game');

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

		init();

		return object;
	};
});