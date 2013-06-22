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
};

app.controller(controllers);
