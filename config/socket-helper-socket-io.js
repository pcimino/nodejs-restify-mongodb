var net = require('net')
  , SocketIo = {};

/**
 * Generates a SocketHelper
 *
 * @constructor
 * @param {Object} options
 */
var SocketHelper = function(config) {
    this.initialize(config);
}

/**
 * Initializes properties
 *
 * @constructor
 * @param {Object} options
 */
SocketHelper.prototype.initialize = function(appConfig) {
    SocketIo = require('socket.io').listen(80);
    console.log("Socket.IO listening on port " + appConfig.socket_port_io);
    SocketIo.sockets.on('connection', function (socket) {
      socket.on('message', function () { });
      socket.on('disconnect', function () { });
    });
/*
  SocketIo = require('socket.io').listen(appConfig.socket_port_io);
  console.log("Socket.IO listening on port " + appConfig.socket_port_io);

    SocketIo.sockets.on('connection', function (socket) {
      socket.on('message', function (data) { console.log(data);});
      socket.on('disconnect', function (data) {console.log(data); });
    });

  SocketIo.sockets.on('connection', function(socket) { //This is a standard net.Socket
      SocketIo.on('message', function(socket) {
          var isRunning = false;
          var streatTimeout;
          socket.on('message', function(name, fn) {
          console.log(name);
          console.log(fn);
            if (message.command == 'start') {
                if (!isRunning) {
                    isRunning = true;
                    streamInterval = setInterval(function() {
                        socket.sendMessage(new Date());
                    }, 1000);
                }
            } else if (message.command == 'stop') {
                if (isRunning) {
                    isRunning = false;
                    clearInterval(streamInterval);
                }
            }
          });
      });
  });
  */
};


// Export SocketHelper constructor
module.exports.SocketHelper = SocketHelper;
