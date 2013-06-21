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

// socket functions
function broadcastMessage(socket, data) {
  var lobby = data.lobby;
  var message = data.message;

  io.sockets['in'](lobby).emit('message', {
    lobby: lobby,
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
    }
    else {
      console.log('error');
    }
  }));
}

function joinLobby(socket, data) {
  var lobby = data.lobby;
  socket.join(lobby);
  User.findByID(socket.id, function(err, data) {
    var name = data.name;
    broadcastMessage(socket, {
      lobby: lobby,
      message: name + ' has joined ' + lobby + '.'
    });
  });
}

function leaveLobby(socket, data) {
  var lobby = data.lobby;
  User.findByID(socket.id, function(err, data) {
    var name = data.name;
    broadcastMessage(socket, {
      lobby: lobby,
      message: name + ' has left ' + lobby + '.'
    });
    socket.leave(lobby);
  });
}

// socket management
io.sockets.on('connection', function (socket) {
  socket.on('name chosen', function (data) {
    // associate data.name with socket.id in mongodb
    var user = new User({
      name: data.name,
      id: socket.id
    });
    user.save();
    broadcastLobbies(socket);
  });

  socket.on('lobby:new', function(data) {
    User.findByID(socket.id, function(err, data) {
      var lobbyName = data.name + '\'s lobby';
      var lobby = new Lobby({
        name: lobbyName,
        users: [socket.id]
      });
      lobby.save(function() {
        broadcastLobbies(socket);
      });
      joinLobby(socket, {lobby: lobbyName});
      socket.emit('lobby:join', {
        lobby: lobbyName
      });
    });
  });

  socket.on('disconnect', function() {
    function disc(err, data) {
      var message = '';
      if (data === null) {
        message = 'An unnamed player has diconnected.';
      }
      else {
        message = data.name + ' has disconnected.';
      }
      broadcastMessage(socket, {
        lobby: lobbyName,
        message: message
      });
    }
    // find user name in mongo based on socket.id
    var lobbies = socket.manager.roomClients[socket.id];
    for (var lobby in lobbies) {
      var lobbyName = lobby;
      if (lobby.length > 0) {
        lobbyName = lobby.substring(1, lobby.length);
        User.findByID(socket.id, disc);
      }
    }
    User.removeByID(socket.id);
  });

  socket.on('lobby:join', function(data) {
    joinLobby(socket, data);
  });

  socket.on('lobby:leave', function(data) {
    leaveLobby(socket, data);
  });

  socket.on('message', function(data) {
    broadcastMessage(socket, data);
  });
});
