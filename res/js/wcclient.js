var socket = io.connect(document.host);

socket.on('message', function (data) {
	console.log(data.message);
	$('#messages').append(data.message + '<br>');
});

jQuery(function($) {
	$('#nameform').submit(function() {
		var name = $('#nameinput').val();
		$('#content').html('<div id="lobbies"></div>' +
			'<div id="messages"></div>');
		socket.emit('name chosen', {
			name: name
		});
		return false;
	});
});
