function LobbyController($scope, socket) {
	$scope.lobbies = [];

	socket.on('lobbies', function (data) {
		$scope.lobbies = data.lobbies;
	});
}