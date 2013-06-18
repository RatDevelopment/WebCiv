function WCController($scope, socket) {
	$scope.lobbies = [];
	$scope.messages = [];

	socket.on('lobbies', function (data) {
		$scope.lobbies = data.lobbies;
	});

	socket.on('message', function (data) {
		$scope.messages.push(data.message);
	});

}