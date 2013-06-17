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
userSchema.statics.findByID = function(id, callback) {
	this.find({id: new RegExp(id, 'i')}, callback);
};

// mongoose models
var User = mongoose.model('User', userSchema);

// express routing
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/res/:type/:file', function(req, res) {
	res.sendfile(__dirname + '/res/' + req.params.type +
	'/' + req.params.file);
});

// socket management
io.sockets.on('connection', function (socket) {
	socket.broadcast.emit('message', {
		message: 'A new player has joined.'
	});
	socket.on('name chosen', function (data) {
		socket.broadcast.emit('message', {
			message: data.name + ' has joined.'
		});
		// associate data.name with socket.id in mongodb
		var user = new User({
			name: data.name,
			id: socket.id
		});
		user.save();
	});
	socket.on('disconnect', function() {
		// find user name in mongo based on socket.id
		User.findByID(socket.id, function(err, data) {
			socket.broadcast.emit('message', {
				message: data[0].name + ' has diconnected.'
			});
		});
	});
});
