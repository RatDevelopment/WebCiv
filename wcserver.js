var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var routes = require('./routes');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server, {log: false});
mongoose.connect('mongodb://127.0.0.1/db');

server.listen(1337);

console.log("---WEBCIV SERVER STARTED---");

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

var lobbySchema = mongoose.Schema({
  name: String,
  limit: Number
});
lobbySchema.statics.findByName = function(name, callback) {
  this.findOne({name: new RegExp(name, 'i')}, callback);
};
lobbySchema.statics.removeByName = function(name, callback) {
  this.findOne({name: new RegExp(name, 'i')}, callback).remove();
};
lobbySchema.statics.findAll = function(callback) {
  this.find({}, callback);
};

// ---- [ mongoose models ] ---------------------------------------------------
var User = mongoose.model('User', userSchema);
var Lobby = mongoose.model('Lobby', lobbySchema);

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

// ---- [ helper functions ] --------------------------------------------------
// returns all socket rooms that aren't ''
function getLobbies() {
  var lobbies = [];
  for (var key in io.sockets.manager.rooms) {
    if (key.length > 0) {
      var lobby = {};
      lobby.name = key.substring(1, key.length);
      lobbies.push(lobby);
    }
  }
  return lobbies;
}

function getLobbyNames() {
  var lobbies = [];
  for (var key in io.sockets.manager.rooms) {
    if (key.length > 0) {
      lobbies.push(key.substring(1, key.length));
    }
  }
  return lobbies;
}

function wclog(message) {
  console.log('--- ' + message + ' ---');
}

function wcerror(message, error) {
  console.log('*** ' + message + ' ***');
  console.log(error);
}

// ---- [ socket functions ] --------------------------------------------------
// sends message to lobby
// data must have data.lobbyName, data.message, and data.name
function lobbyMessage(socket, data) {
  try {
    var lobbyName = data.lobbyName;
    var message = data.message;
    var name = data.name;
    io.sockets['in'](lobbyName).emit('message', {
      lobbyName: lobbyName,
      message: message,
      name: name
    });
  } catch(err) {
    wcerror('lobby message error', err);
  }
}

// broadcasts all lobbies to all users
// should be called when there is a possible change in lobbies
function broadcastLobbies() {
  console.log("---broadcasting lobbies---");
  var lobbies = getLobbies();
  Lobby.findAll(function(err, data) {
    for (var i in data) {
      if (getLobbyNames().indexOf(data[i].name) === -1) {
        Lobby.removeByName(data[i].name);
      }
    }
  });
  io.sockets.emit('lobby:list', {
    lobbies: lobbies
  });
}

// emits lobbies to single user
function emitLobbies(socket) {
  socket.emit('lobby:list', {
    lobbies: getLobbies()
  });
}

// clears $scope.messages on the clientside
function clearMessages(socket) {
  socket.emit('messages:clear');
}

// joins socket lobby
// data must have data.lobbyName
function joinLobby(socket, data) {
  try {
    var lobbyName = data.lobbyName;
    socket.join(lobbyName);
    User.findByID(socket.id, function(err, data) {
      var name = data.name;
      wclog(name + " joined " +  lobbyName);
      clearMessages(socket);
      lobbyMessage(socket, {
        lobby: lobbyName,
        message: name + ' has joined ' + lobbyName + '.'
      });
      broadcastLobbies();
    });
  } catch(err) {
    wcerror('lobby join error', err);
  }
}

// leave socket lobbyName
// data must have data.lobbyName
function leaveLobby(socket, data) {
  try {
    var lobbyName = data.lobbyName;
    User.findByID(socket.id, function(err, data) {
      var name = data.name;
      wclog(name + ' left ' +  lobbyName);
      lobbyMessage(socket, {
        lobbyName: lobbyName,
        message: name + ' has left ' + lobbyName + '.'
      });
      clearMessages(socket);
      socket.leave(lobbyName);
      broadcastLobbies();
    });
  } catch(err) {
    wcerror('lobby leave error', err);
  }
}

// ---- [ socket management ] -------------------------------------------------
io.sockets.on('connection', function (socket) {
  // name is chosen for user
  socket.on('name:chosen', function (data) {
    try {
      var name = data.name;
      wclog(name + ' has connected');
      var user = new User({
        name: name,
        id: socket.id
      });
      user.save();
      emitLobbies(socket);
    } catch(err) {
      wcerror('name choose error', err);
    }
  });

  // new lobby is made by user
  socket.on('lobby:new', function(data) {
    try {
      var lobbyName = data.lobbyName;
      var lobby = new Lobby({
        name: lobbyName,
        limit: 8
      });
      lobby.save();
      User.findByID(socket.id, function(err, data) {
        var name = data.name;
        wclog(name + " created " + lobbyName);
        joinLobby(socket, {
          lobbyName: lobbyName,
          name: name
        });
        socket.emit('lobby:join', {
          lobbyName: lobbyName
        });
        broadcastLobbies();
      });
    } catch(err) {
      wcerror('new lobby error', err);
    }
  });

  // user disconnects
  socket.on('disconnect', function() {
    function lobbyDisc(err, data) {
      var message = '';
      if (data === null) {
        message = 'An unnamed player has diconnected.';
      }
      else {
        message = data.name + ' has disconnected.';
      }
      lobbyMessage(socket, {
        lobbyName: lobbyName,
        message: message
      });
      broadcastLobbies();
    }
    function disc(err, data) {
      if (data === null) {
        wclog('an unnamed player has disconnected');
      }
      else {
        wclog(data.name + ' has disconnected');
      }
      User.removeByID(socket.id);
    }
    // find user name in mongo based on socket.id
    var lobbies = socket.manager.roomClients[socket.id];
    for (var lobby in lobbies) {
      var lobbyName = lobby;
      if (lobby.length > 0) {
        lobbyName = lobby.substring(1, lobby.length);
        User.findByID(socket.id, lobbyDisc);
      } else {
        User.findByID(socket.id, disc);
      }
    }
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
