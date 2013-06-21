var socket = io.connect();

socket.on('message', function (data) {
  $('#messages').append(data.message + '<br>');
});

socket.on('lobby:join', function(data) {
  var lobby = data.lobby;
  $.localStorage('lobby', lobby);
  $('#content2').hide();
  $('#content3').show();
});

jQuery(function($) {
  $('#nameform').submit(function() {
    var name = $('#nameinput').val();
    $('#content').hide();
    $('#content2').show();
    $('#newlobby').click(function() {
      socket.emit('lobby:new', {});
    });
    socket.emit('name chosen', {
      name: name
    });

    $.localStorage('lobby', '');
    $.localStorage('username', name);
    return false;
  });

  $(document).on('click', '.lobbyJoin', function() {
    var lobby = $(this).attr('room');
    $.localStorage('lobby', lobby);
    $('#content2').hide();
    $('#content3').show();
    socket.emit('lobby:join', {
      lobby: lobby
    });
  });

  $('.lobbyLeave').click(function() {
    var lobby = $.localStorage('lobby');
    $.localStorage('lobby', '');
    $('#content2').show();
    $('#content3').hide();
    socket.emit('lobby:leave', {
      lobby: lobby
    });
  });

  $('#messageForm').submit(function() {
    var name = $.localStorage('username');
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

  function getLobby() {
    var lobby = $.localStorage('lobby');
    if (!lobby) {
      lobby = '';
    }
    return lobby;
  }
});
