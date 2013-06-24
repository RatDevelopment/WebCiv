var controllers = {};

controllers.WCController = function ($scope, socket) {
  // ---- [ scope vars init ] -------------------------------------------------
  $scope.lobbies = [];
  $scope.messages = [];
  $scope.lobby = '';
  $scope.partial = 'login';

  // ---- [ socket functions ] ------------------------------------------------
  socket.on('lobby:list', function (data) {
    $scope.lobbies = data.lobbies;
  });

  socket.on('lobby:join', function(data) {
    var lobby = data.lobby;
    $.localStorage('lobby', lobby);
    $scope.partial = 'lobby';
  });

  socket.on('message', function (data) {
    $scope.messages.push(data.message);
  }, function() {
    $('#chatWindow').scrollTop($('#chatWindow').prop('scrollHeight'));
  });

  socket.on('messages:clear', function(data) {
    $scope.messages = [];
    $scope.lobby = $.localStorage('lobby');
  });

  // ---- [ scope functions ] -------------------------------------------------
  $scope.submitName = function() {
    var name = $('#nameInput').val();
    $scope.partial = 'lobbylist';

    socket.emit('name chosen', {
      name: name
    });

    $.localStorage('lobby', '');
    $.localStorage('username', name);
    return false;
  };

  $scope.sendMessage = function() {
    var name = $.localStorage('username');
    var lobby = getLobby();
    var message = $('#messageField').val();

    if (message) {
      socket.emit('message', {
        name: name,
        lobby: lobby,
        message: name + ': ' + message
      });
      $('#messageField').val('');
    }
    return false;
  };

  $scope.newLobby = function() {
      socket.emit('lobby:new', {});
  };

  $scope.lobbyLeave = function() {
    var lobby = $.localStorage('lobby');
    $.localStorage('lobby', '');
    $scope.partial = 'lobbylist';
    socket.emit('lobby:leave', {
      lobby: lobby
    });
  };

  $scope.lobbyJoin = function(lobby) {
    $.localStorage('lobby', lobby);
    $scope.partial = 'lobby';
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
