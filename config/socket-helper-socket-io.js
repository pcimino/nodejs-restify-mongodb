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

  // This would allow Socket.IO to listen on the same port as the server, but WS is already doing that
  // SocketIo = require('socket.io').listen(app);;

  // note, io.listen(<port>) will create a http server for you
  SocketIo = require('socket.io').listen(parseInt(appConfig.socket_port_io));
  console.log("Socket.IO listening on port " + appConfig.socket_port_io);

  SocketIo.sockets.on('connection', function(socket) {
    var id = setInterval(function() {
      socket.send(JSON.stringify(new Date()), function() {  }); // ignore errors
    }, 500);
    console.log('started client interval');
    socket.on('close', function() {
      console.log('stopping client interval');
      clearInterval(id);
    })
  });
};


// Export SocketHelper constructor
module.exports.SocketHelper = SocketHelper;
