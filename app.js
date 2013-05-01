// Modules
var restify = require("restify")
  , mongoose = require('mongoose')
  , fs = require('fs');

// Load configurations
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env];
  
// Paths
var models_path = config.root + '/models'
var config_path = config.root + '/config'

// Database
var connectStr = config.db_prefix +'://'+config.host+':'+config.db_port+'/'+config.db_database;
console.log(connectStr);
mongoose.connect(connectStr);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Database connection opened.");
});

// Bootstrap models
fs.readdirSync(models_path).forEach(function (file) {
  console.log("Loading model " + file);
  require(models_path+'/'+file);
});

// Configure the server
var app = restify.createServer({
  //certificate: ...,
  //key: ...,
  name: 'crud-test',
  version: config.version
});

// restify settings
require(config_path + '/restify')(app, config);

// Bootstrap routes
var auth = require(config_path + '/middlewares/authorization.js');

// configure email
var MailHelper = require(config_path + '/mail-helper.js').MailHelper;

require(config_path + '/routes')(app, config, auth, new MailHelper(config));

// configure Socket Server
var SocketHelper = require(config_path + '/socket-helper.js').SocketHelper;
new SocketHelper(config);

// Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
console.log('App started on port ' + port);
