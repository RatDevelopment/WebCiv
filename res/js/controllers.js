var controllers = {};

controllers.WCController = function ($scope, socket) {
  $scope.lobbies = [];
  $scope.messages = [];
  $scope.lobby = '';

  socket.on('lobbies', function (data) {
    $scope.lobbies = data.lobbies;
  });

  socket.on('message', function (data) {
    $scope.messages.push(data.message);
  });

  socket.on('messages:clear', function(data) {
    $scope.messages = [];
    $scope.lobby = $.localStorage('lobby');
  });
};

app.controller(controllers);
