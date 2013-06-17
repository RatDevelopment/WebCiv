var socket = io.connect();

socket.on('message', function (data) {
	$('#messages').append(data.message + '<br>');
});

socket.on('lobbies updated', function (data) {
	console.log(JSON.stringify(data));
});

jQuery(function($) {
	$('#nameform').submit(function() {
		var name = $('#nameinput').val();
		$('#content').html('<button id="newlobby">New Lobby</button><div id="lobbies"></div>' +
			'<div id="messages"></div>');
		$('#newlobby').click(function() {
			socket.emit('new lobby', {});
		});
		socket.emit('name chosen', {
			name: name
		});
		return false;
	});
});
