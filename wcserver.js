var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(1337);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/res/:type/:file', function(req, res) {
	res.sendfile(__dirname + '/res/' + req.params.type +
	'/' + req.params.file);
});

io.sockets.on('connection', function (socket) {
	socket.broadcast.emit('message', {
		message: 'A new player has joined.'
	});
	socket.on('name chosen', function (data) {
		socket.broadcast.emit('message', {
			message: data.name + ' has joined.'
		});
	});
});