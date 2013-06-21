var socket = io.connect();

socket.on('message', function (data) {
  $('#messages').append(data.message + '<br>');
});

jQuery(function($) {
  $('#nameform').submit(function() {
    var name = $('#nameinput').val();
    $('#content').hide();
    $('#content2').show();
    $('#content3').show();
    $('#newlobby').click(function() {
      socket.emit('new lobby', {});
    });
    socket.emit('name chosen', {
      name: name
    });

    $.localStorage('lobby', '');
    $.localStorage('username', name);
    return false;
  });

  $('#messageForm').submit(function() {
    var name = $.localStorage( 'username' );
    var lobby = getLobby();
    var message = $('#messageField').val();

    socket.emit('message', {
      name: name,
      lobby: lobby,
      message: name + ': ' + message
    });
    $('#messageField').val('');
    return false;
  });

  $('#lobbyForm').submit(function() {
    var name = $.localStorage('username');
    var oldLobby = getLobby();
    var lobby = $('#lobbyinput').val();

    $('#messageContent').show();
    socket.emit('join', {
      name: name,
      oldLobby: oldLobby,
      lobby: lobby
    });
    $.localStorage('lobby', lobby);
    $('#lobbyinput').val('');
    return false;
  });

  function getLobby() {
    var lobby = $.localStorage('lobby');
    if (!lobby) {
      lobby = "";
    }
    return lobby;
  }
});
