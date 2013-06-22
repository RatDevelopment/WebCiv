angular.module('wc.services', []).
  factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback, callback2) {
        socket.on(eventName, function () {
        var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
          if (typeof callback2 !== "undefined") {
            callback2.call();
          }
        });
      },

      emit: function (eventName, data, callback, callback2) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
          if (typeof callback2 !== "undefined") {
            callback2.call();
          }
        });
      }
    };
  });
