var controllers = {};

controllers.WCController = function ($scope, socket) {
  // ---- [ scope vars init ] -------------------------------------------------
  $scope.lobbies = [];
  $scope.username = '';

  // views
  $scope.mainview = 'login';
  $scope.modal = null;

  // new lobby form
  $scope.newLobby = {};

  // lobby
  $scope.lobby = {};
  $scope.messages = [];

  // ---- [ socket functions ] ------------------------------------------------
  socket.on('lobby:list', function (data) {
    $scope.lobbies = data.lobbies;
    for (var i in $scope.lobbies) {
      $scope.lobbies[i].show =
        $scope.lobbies[i].usersConnected < $scope.lobbies[i].maxPlayers;
    }
  });

  socket.on('lobby:join', function() {
    $scope.mainview = 'lobby';
  });

  socket.on('lobby:update', function(data) {
    var lobbyName = data.lobbyName;
    var users = data.users;
    $.localStorage('lobby', lobbyName);
    $scope.lobby.name = lobbyName;
    $scope.lobby.users = users;
  });

  socket.on('lobby:checkName', function(data) {
    $scope.newLobby.lobbyExists = data.lobbyExists;
  });

  socket.on('message', function (data) {
    $scope.messages.push(data);
  }, function() {
    $('#chatWindow').scrollTop($('#chatWindow').prop('scrollHeight'));
  });

  socket.on('messages:clear', function() {
    $scope.messages = [];
    $scope.lobby.name = $.localStorage('lobby');
  });

  socket.on('error', function(data) {
    alert(data.message);
  });

  // ---- [ scope functions ] -------------------------------------------------
  $scope.init = function() {
    var name = $.localStorage('username');
    if (!!name) {
      $scope.submitName(name);
    }
  };

  $scope.contentClicked = function($event) {
    // make modal popup go away
    if ($scope.modal !== null && $event.target.nodeName !== 'BUTTON') {
      $('#modal').fadeOut(100, function() {
        $scope.modal = null;
      });
      $('#wccontent').fadeTo(100, 1);
    }
  };

  $scope.submitName = function(name) {
    // display lobby list
    $scope.mainview = 'lobbylist';
    socket.emit('name:chosen', {
      name: name
    });
    $.localStorage('lobby', '');
    $.localStorage('username', name);
    $scope.username = name;
    $scope.newLobby.lobbyName = $scope.username + "'s lobby";
    $scope.newLobby.maxPlayers = 8;
    return false;
  };

  $scope.sendMessage = function(message) {
    var name = $.localStorage('username');
    var lobbyName = getLobbyName();
    if (message) {
      socket.emit('message', {
        name: name,
        lobbyName: lobbyName,
        message: message
      });
      $scope.lobby.messageField = '';
    }
    return false;
  };

  $scope.openModal = function(partial) {
    $scope.modal = partial;
    $('#modal').fadeIn(100);
    $('#wccontent').fadeTo(100, 0.5);
    if (partial === 'newlobby') {
      $scope.checkLobbyName($scope.newLobby.lobbyName);
    }
  };

  $scope.closeModal = function() {
    $scope.modal = null;
    $('#modal').fadeOut(100);
    $('#wccontent').fadeTo(100, 1);
  };

  $scope.lobbyNew = function(lobbySettings) {
    socket.emit('lobby:new', {
      lobbyName: lobbySettings.lobbyName,
      maxPlayers: lobbySettings.maxPlayers
    });
    $scope.closeModal();
    return false;
  };

  $scope.lobbyLeave = function() {
    var lobbyName = $.localStorage('lobby');
    $.localStorage('lobby', '');
    socket.emit('lobby:leave', {
      lobbyName: lobbyName
    });
    $scope.mainview = 'lobbylist';
  };

  $scope.lobbyJoin = function(lobbyName) {
    socket.emit('lobby:join', {
      lobbyName: lobbyName
    });
  };

  $scope.checkLobbyName = function(lobbyName) {
    socket.emit('lobby:checkName', {
      lobbyName: lobbyName
    });
  };

  // --- [ helpder functions ] ------------------------------------------------
  var getLobbyName = function() {
    var lobbyName = $.localStorage('lobby');
    if (!lobbyName) {
      lobbyName = '';
    }
    return lobbyName;
  };
};

app.controller(controllers);
