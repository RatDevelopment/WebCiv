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
    var lobby = data.lobby;
    $.localStorage('lobby', lobby);
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
    var lobby = getLobby();
    if (message) {
      socket.emit('message', {
        name: name,
        lobby: lobby,
        message: message
      });
      $scope.lobby.messageField = '';
    }
    return false;
  };

  $scope.openModal = function(partial) {
    $scope.modal = partial;
    $('#modal').fadeIn(100);
    $('#wcconent').fadeTo(100, 0.1);
  };

  $scope.closeModal = function() {
    $scope.modal = null;
    $('#modal').fadeOut(100);
    $('#wcconent').fadeTo(100, 1);
  };

  $scope.lobbyNew = function(lobbyName) {
    socket.emit('lobby:new', {
      lobbyName: lobbyName
    });
    $scope.closeModal();
    return false;
  };

  $scope.lobbyLeave = function() {
    var lobby = $.localStorage('lobby');
    $.localStorage('lobby', '');
    $scope.mainview = 'lobbylist';
    socket.emit('lobby:leave', {
      lobby: lobby
    });
  };

  $scope.lobbyJoin = function(lobby) {
    $.localStorage('lobby', lobby);
    $scope.mainview = 'lobby';
    socket.emit('lobby:join', {
      lobby: lobby
    });
  };

  // --- [ helpder functions ] ------------------------------------------------
  var getLobby = function() {
    var lobby = $.localStorage('lobby');
    if (!lobby) {
      lobby = '';
    }
    return lobby;
  };
};

app.controller(controllers);
