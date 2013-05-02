var net = require('net')
  , ws = require('ws');

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
    var WebSocketServer = require('ws').Server;
    var wss = new WebSocketServer({port: appConfig.socket_port_ws});
  console.log("WS Web socket listening on port " + appConfig.socket_port_ws);
  wss.on('connection', function(ws) {
    console.log("Connection established");
      ws.on('message', function(message) {
        console.log(message);
          var isRunning = false;
          var streatTimeout;

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
};


// Export SocketHelper constructor
module.exports.SocketHelper = SocketHelper;
