var controllers = {};

controllers.WCController = function ($scope, socket) {
  // ---- [ scope vars init ] -------------------------------------------------
  $scope.lobbies = [];
  $scope.lobbyName = '';
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
  });

  socket.on('lobby:join', function(data) {
    var lobbyName = data.lobbyName;
    $.localStorage('lobby', lobbyName);
    $scope.mainview = 'lobby';
  });

  socket.on('message', function (data) {
    $scope.messages.push(data);
  }, function() {
    $('#chatWindow').scrollTop($('#chatWindow').prop('scrollHeight'));
  });

  socket.on('messages:clear', function(data) {
    $scope.messages = [];
    $scope.lobbyName = $.localStorage('lobby');
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
    $scope.mainview = 'lobbylist';
    socket.emit('name:chosen', {
      name: name
    });
    $.localStorage('lobby', '');
    $.localStorage('username', name);
    $scope.username = name;
    $scope.newLobby.lobbyName = $scope.username + "'s lobby";
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
  };

  $scope.closeModal = function() {
    $scope.modal = null;
    $('#modal').fadeOut(100);
    $('#wccontent').fadeTo(100, 1);
  };

  $scope.lobbyNew = function(lobbyName) {
    socket.emit('lobby:new', {
      lobbyName: lobbyName
    });
    $scope.closeModal();
    return false;
  };

  $scope.lobbyLeave = function() {
    var lobbyName = $.localStorage('lobby');
    $.localStorage('lobby', '');
    $scope.mainview = 'lobbylist';
    socket.emit('lobby:leave', {
      lobbyName: lobbyName
    });
  };

  $scope.lobbyJoin = function(lobbyName) {
    $.localStorage('lobby', lobbyName);
    $scope.mainview = 'lobby';
    socket.emit('lobby:join', {
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
