var socket = io.connect();

socket.on('message', function (data) {
	$('#messages').append(data.message + '<br>');
});

jQuery(function($) {
	$('#nameform').submit(function() {
		var name = $('#nameinput').val();
		$('#content').hide();
		$('#content2').show();
		$('#messageContent').show();
		$('#content3').show();
		$('#newlobby').click(function() {
			socket.emit('new lobby', {});
		});
		socket.emit('name chosen', {
			name: name
		});
		return false;
	});
	
	$('#messageForm').submit(function() {
		var lobby = $('#lobbyinput').val();
		if (!lobby) {
			lobby = "";
		}
		var message = $('#messageField').val();
		socket.emit('message', {
			lobby: lobby,
			message: message
		});
		return false;
	});
	
	$('#lobbyForm').submit(function() {
		var lobby = $('#lobbyinput').val();
		socket.emit('join', {
			lobby: lobby
		});
	});
});