// "classes"

function sprite(src) {
	var img = new Image();
	img.src = 'res/img/' + src;
	return img;
}

// sprites
var sprites = {
	ground: sprite('ground.png'),
	water: sprite('water.png'),
	blank: sprite('blank.png')
};

// functions
function translate(point, translation) {
	return point2D(point.x+translation.x, point.y+translation.y);
}

function verticalDilute(point, dilution) {
	return point2D(point.x, point.y/dilution);
}

function toIso(point, camera) {
	var translatedPoint = translate(point, camera);
	var isox = Math.floor(translatedPoint.x);
	var isoy = Math.floor(translatedPoint.y);
	return point2D(isox, isoy);
}

function drawSprite(tile, tileWidth, yspace, camera, context) {
	var xoffset = Math.abs(tile.y) % 2 === 1 ? tileWidth/2 : 0;
	var spritePoint = toIso(point2D(xoffset + tile.x*tileWidth,
		tile.y*yspace), camera);
	context.drawImage(sprites[tile.type], spritePoint.x, spritePoint.y);
}

function drawGrid(map, tileWidth, tileHeight, canvasId, camera) {
	var docwidth = $(window).width();
	var docheight = $(window).height()-5;
	var canvas = document.getElementById(canvasId);
	$('#' + canvasId).attr("width", docwidth);
	$('#' + canvasId).attr("height", docheight);
	var context = canvas.getContext('2d');
	var yspace = Math.floor(3*tileHeight/4);
	var camx = Math.floor(-1*camera.x/tileWidth);
	var camy = Math.floor(-1*camera.y/yspace);
	for (var i = -1; i <= Math.ceil(docwidth/tileWidth); i++) {
		for (var j = -1; j <= Math.ceil(docheight/yspace); j++) {
			var tile = map.getTile(i+camx, j+camy);
				drawSprite(tile, tileWidth, yspace, camera, context);
		}
	}
}

// $.fn.isogrid implementation
jQuery(function($){
	$.fn.isogrid = function(options) {
		// settings
		var settings = {
			map: {},
			tileWidth: 128,
			tileHeight: 106
		};

		// custom settings
		$.extend(settings, options);

		// make camera, center it
		var camera = point2D(-1*settings.map.cols*settings.tileWidth/2,
			-1*settings.map.rows*settings.tileHeight/2);
		camera = point2D(0,0);

		// initialize grid
		function init() {
			// generate grid
			object.redraw();
		}

		// object will contain methods to interact with the grid
		var object = {
			update: function(data) {
				// update
			},
			translate: function(vector) {
				// translate
			},
			redraw: function() {
				drawGrid(settings.map, settings.tileWidth, settings.tileHeight,
					elid, camera);
			}
		};

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
				x: camera.x,
				y: camera.y
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
				camera.x = newx;
				camera.y = newy;
				object.redraw();
			}
		});

		// resize handler
		$(window).resize(function() {
			object.redraw();
		});

		// init on load image
		sprites.ground.onload = init;

		return object;
	};
});