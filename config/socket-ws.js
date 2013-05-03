var WebSocketServer = require('ws').Server
  , net = require('net');

/**
 * Generates a SocketHelper
 *
 * @constructor
 * @param {Object} options
 */
var SocketHelper = function(app, config) {
    this.initialize(app, config);
}

/**
 * Initializes properties
 *
 * @constructor
 * @param {Object} options
 */


SocketHelper.prototype.initialize = function(app, appConfig) {
  var wss = new WebSocketServer({server: app});
  wss.on('connection', function(ws) {
    var id = setInterval(function() {
      ws.send(JSON.stringify(new Date()), function() { /* ignore errors */ });
    }, 500);
    console.log('started client interval');
    ws.on('close', function() {
      console.log('stopping client interval');
      clearInterval(id);
    })
  });
};


// Export SocketHelper constructor
module.exports.SocketHelper = SocketHelper;
