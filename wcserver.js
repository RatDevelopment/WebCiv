var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var routes = require('./routes');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
mongoose.connect('mongodb://127.0.0.1/db');

server.listen(1337);

// ---- [ mongoose schemas ] --------------------------------------------------
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

// ---- [ mongoose models ] ---------------------------------------------------
var User = mongoose.model('User', userSchema);

// ---- [ jade ] ---------------------------------------------------
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/res'));
  app.use(app.router);
});

// ---- [ express routing ] ---------------------------------------------------
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// ---- [ socket functions ] --------------------------------------------------
// sends message to lobby
// data must have data.lobby and data.message
function lobbyMessage(socket, data) {
  var lobby = data.lobby;
  var message = data.message;
  io.sockets['in'](lobby).emit('message', {
    lobby: lobby,
    message: message
  });
}

// emits all lobbies
// should be called when there is a possible change in lobbies
function broadcastLobbies() {
  var lobbies = [];
  for (var key in io.sockets.manager.rooms) {
    if (key.length > 0) {
      var lobby = {};
      lobby.name = key.substring(1, key.length);
      lobbies.push(lobby);
    }
  }
  io.sockets.emit('lobby:list', {
    lobbies: lobbies
  });
}

// clears $scope.messages on the clientside
function clearMessages(socket) {
  socket.emit('messages:clear');
}

// joins socket lobby
// data must have data.lobby
function joinLobby(socket, data) {
  if (data !== null) {
    var lobby = data.lobby;
    socket.join(lobby);
    User.findByID(socket.id, function(err, data) {
      var name = data.name;
      clearMessages(socket);
      lobbyMessage(socket, {
        lobby: lobby,
        message: name + ' has joined ' + lobby + '.'
      });
      broadcastLobbies();
    });
  }
}

// leave socket lobby
// data must have data.lobby
function leaveLobby(socket, data) {
  if (data !== null) {
    var lobby = data.lobby;
    User.findByID(socket.id, function(err, data) {
      var name = data.name;
      lobbyMessage(socket, {
        lobby: lobby,
        message: name + ' has left ' + lobby + '.'
      });
      clearMessages(socket);
      socket.leave(lobby);
      broadcastLobbies();
    });
  }
}

// ---- [ socket management ] -------------------------------------------------
io.sockets.on('connection', function (socket) {
  // name is chosen for user
  socket.on('name chosen', function (data) {
    var user = new User({
      name: data.name,
      id: socket.id
    });
    user.save();
    broadcastLobbies();
  });

  // new lobby is made by user
  socket.on('lobby:new', function(data) {
    User.findByID(socket.id, function(err, data) {
      var lobbyName = data.name + '\'s lobby';
      joinLobby(socket, {lobby: lobbyName});
      socket.emit('lobby:join', {
        lobby: lobbyName
      });
      broadcastLobbies();
    });
  });

  // user disconnects
  socket.on('disconnect', function() {
    function disc(err, data) {
      var message = '';
      if (data === null) {
        message = 'An unnamed player has diconnected.';
      }
      else {
        message = data.name + ' has disconnected.';
      }
      lobbyMessage(socket, {
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
    broadcastLobbies();
  });

  // when user joins a lobby
  socket.on('lobby:join', function(data) {
    joinLobby(socket, data);
  });

  // when user leaves a lobby
  socket.on('lobby:leave', function(data) {
    leaveLobby(socket, data);
  });

  //when user sends a message to a lobby
  socket.on('message', function(data) {
    lobbyMessage(socket, data);
  });
});
