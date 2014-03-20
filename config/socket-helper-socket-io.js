/**
* Wrapper functionality for socket management
*/
var net = require('net')
  , SocketIo = {}
  , config = require('./config').get();

// http://mattmueller.me/blog/quick-tip-node-js-socket-io-authentication

/**
 * Generates a SocketHelper
 *
 * https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
 *
 * @constructor
 * @param {Object} options
 */
var SocketHelper = function(app) {
    this.initialize(app, config);
};

/**
 * Initializes properties
 *
 * @constructor
 * @param {Object} options
 */
SocketHelper.prototype.initialize = function(app, appConfig) {

  // This would allow Socket.IO to listen on the same port as the server
  SocketIo = require('socket.io').listen(app, {'log level': appConfig.socket_loglevel});
  console.log("Socket.IO listening on port " + appConfig.port);

  SocketIo.sockets.on('connection', function(socket) {
    var id = setInterval(function() {
      var timeStamp = JSON.stringify(new Date());
      socket.volatile.emit('timestamp', timeStamp, function() {  }); // ignore errors
    }, 1000);
    socket.on('close', function() {
      console.log('stopping client interval');
      clearInterval(id);
    });
  });
};


// Export SocketHelper constructor
module.exports.SocketHelper = SocketHelper;
