var socket = io.connect();

socket.on('message', function (data) {
	$('#messages').append(data.message + '<br>');
});

jQuery(function($) {
	$('#nameform').submit(function() {
		var name = $('#nameinput').val();
		$('#content').hide();
		$('#content2').show();
		$('#newlobby').click(function() {
			socket.emit('new lobby', {});
		});
		socket.emit('name chosen', {
			name: name
		});
		return false;
	});
});