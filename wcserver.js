var express = require('express');
var http = require('http');
var mongoose = require('mongoose');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
mongoose.connect('mongodb://127.0.0.1/db');

server.listen(1337);

// mongoose schemas
var userSchema = mongoose.Schema({
	name: String,
	id: String
});
userSchema.statics.removeByID = function(id, callback) {
	this.findOne({id: new RegExp(id, 'i')}, callback).remove();
};
userSchema.statics.findByID = function(id, callback) {
	this.findOne({id: new RegExp(id, 'i')}, callback);
};
var lobbySchema = mongoose.Schema({
	name: String,
	users: Array
});

// mongoose models
var User = mongoose.model('User', userSchema);
var Lobby = mongoose.model('Lobby', lobbySchema);

// express routing
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/res/:type/:file', function(req, res) {
	res.sendfile(__dirname + '/res/' + req.params.type +
	'/' + req.params.file);
});

function joinLobby(socket, lobby) {
	socket.join(lobby);
	broadcastToLobby(socket, lobby, "User joined");
}

function sendMessage(socket, message) {
	socket.emit('message', {
		message: message
	});
}

// socket functions
function broadcastMessage(socket, message) {
	socket.broadcast.emit('message', {
		message: message
	});
	sendMessage(socket, message);
}

function broadcastToLobby(socket, lobby, message) {
	io.sockets.in(lobby).emit('message', {
		message: message
	});
}

function broadcastLobbies(socket) {
	Lobby.find({}, (function(err, data) {
		if (!err) {
			socket.broadcast.emit('lobbies', {
				lobbies: data
			});
			socket.emit('lobbies', {
				lobbies: data
			});
		} else {
			console.log('error');
		}
	}));
}

// socket management
io.sockets.on('connection', function (socket) {
	socket.on('name chosen', function (data) {
		broadcastMessage(socket, data.name + ' has joined.');
		// associate data.name with socket.id in mongodb
		var user = new User({
			name: data.name,
			id: socket.id
		});
		user.save();
		broadcastLobbies(socket);
	});

	socket.on('new lobby', function(data) {
		User.findByID(socket.id, function(err, data) {
			var lobbyName = data.name + "'s lobby";
			var lobby = new Lobby({
				name: lobbyName,
				users: [socket.id]
			});
			lobby.save(function() {
				broadcastLobbies(socket);
			});
			joinLobby(socket, lobby.name);
		});
	});

	socket.on('disconnect', function() {
		// find user name in mongo based on socket.id
		User.removeByID(socket.id, function(err, data) {
			if (data === null) {
				broadcastMessage(socket, 'An unnamed player has diconnected.');
			} else {
				broadcastMessage(socket, data.name + ' has disconnected.');
			}
		});
	});
	
	socket.on('join', function(data) {
		joinLobby(socket, data.lobby);
	});
	
	socket.on('message', function(data) {
		broadcastToLobby(socket, data.lobby, data.message);
	});
});
