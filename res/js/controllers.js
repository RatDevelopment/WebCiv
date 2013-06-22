var controllers = {};

controllers.WCController = function ($scope, socket) {
  $scope.lobbies = [];
  $scope.messages = [];
  $scope.lobby = '';

  socket.on('lobby:list', function (data) {
    $scope.lobbies = data.lobbies;
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

  $scope.submitName = function() {
    var name = $('#nameInput').val();
    $('#loginContent').hide();
    $('#listingContent').show();
    $('#newLobby').click(function() {
      socket.emit('lobby:new', {});
    });
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

  var getLobby = function() {
    var lobby = $.localStorage('lobby');
    if (!lobby) {
      lobby = '';
    }
    return lobby;
  };
};

app.controller(controllers);
