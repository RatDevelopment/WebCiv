var socket = io.connect();

socket.on('lobby:join', function(data) {
  var lobby = data.lobby;
  $.localStorage('lobby', lobby);
  $('#listingContent').hide();
  $('#chatContent').show();
});

jQuery(function($) {
  $(document).on('click', '.lobbyJoin', function() {
    var lobby = $(this).attr('room');
    $.localStorage('lobby', lobby);
    $('#listingContent').hide();
    $('#chatContent').show();
    socket.emit('lobby:join', {
      lobby: lobby
    });
  });

  $(document).on('click', '.lobbyLeave', function() {
    var lobby = $.localStorage('lobby');
    $.localStorage('lobby', '');
    $('#listingContent').show();
    $('#chatContent').hide();
    socket.emit('lobby:leave', {
      lobby: lobby
    });
  });
});
