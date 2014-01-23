/**
* Main application server setup
*/
var cmdlineEnv = process.argv[2];
// if command line option given, override NODE_ENV
console.log(cmdlineEnv)
if (cmdlineEnv && cmdlineEnv.length > 0) {
  if (cmdlineEnv == '-d' || cmdlineEnv.toUpperCase() == '--DEVELOPMENT') {
      process.env.NODE_ENV = 'development';
  } else if (cmdlineEnv == '-q' || cmdlineEnv.toUpperCase() == '--QA') {
      process.env.NODE_ENV = 'qa';
  } else if (cmdlineEnv == '-p' || cmdlineEnv.toUpperCase() == '--PRODUCTION') {
      process.env.NODE_ENV = 'production';
  }  else if (cmdlineEnv == '-u' || cmdlineEnv.toUpperCase() == '--UNIT_TEST') {
      process.env.NODE_ENV = 'unit_test';
  } else {
    console.log("Usage: node app.js");
    console.log("Default usage uses the Devlopment configuration unless NODE_ENV is defined as [develoopment|test|production]");
    console.log("The environment variable can be overridden on the command line using one of the following arguments:");
    console.log("\tnode app.js [-d|-q|-p|-u|--development|--qa|--production|--unit_test]");
    console.log("Alternatively there are scripts defined in package.json, to use one of these:");
    console.log("\tnpm run-scripts <dev|qa|prod|database>");
    console.log("Where database is used to set up the database the first time, and is envirnment specific, probably want to use the scripts.");
    return false;
  }
}

// Load configurations
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env];

// Modules
var restify = require("restify")
  , mongoose = require('mongoose')
  , fs = require('fs')
  , preflightEnabler = require('se7ensky-restify-preflight');

// Paths
var models_path = config.root + '/models'
var utils_path = config.root + '/jsUtil'
var config_path = config.root + '/config'

// Database
var connectStr = config.db_prefix +'://'+config.host+':'+config.db_port+'/'+config.db_database;
console.log(connectStr);
mongoose.connect(connectStr, {server:{auto_reconnect:true}});
var db = mongoose.connection;

// the reconnect seems to behave properly, but the link to this particular instance gets lost?
// the recinnected and open don't work after a disconnect, although everything else seems to be working
mongoose.connection.on('opening', function() {
  console.log("reconnecting... %d", mongoose.connection.readyState);
});
db.once('open', function callback () {
  console.log("Database connection opened.");
});
db.on('error', function (err) {
  console.log("DB Connection error %s", err);
});
db.on('reconnected', function () {
  console.log('MongoDB reconnected!');
});
db.on('disconnected', function() {
  console.log('MongoDB disconnected!');
  mongoose.connect(connectStr, {server:{auto_reconnect:true}});
});


// Bootstrap models
fs.readdirSync(models_path).forEach(function (file) {
  console.log("Loading model " + file);
  require(models_path+'/'+file);
});


// Bootstrap auth middleware
var auth = require(config_path + '/middlewares/authorization.js');
auth.setConfig(config);

// Bootstrap JavaScript utilities
// globals considered bad, eventually this container should be rewritten into a module
globalUtil = {};
fs.readdirSync(utils_path).forEach(function (file) {
  console.log("Loading utility " + file);
  var variableName = file.substring(0, file.indexOf('.'));
  require(utils_path+'/'+file)(globalUtil, config, auth);
});
//console.log(globalUtil.generatePassword());

// Configure the server
var app = restify.createServer({
  //certificate: ...,
  //key: ...,
  name: 'crud-test',
  version: config.version
});


app.on('error', function(err) {
    if(err.errno === 'EADDRINUSE') {
      console.log('Port already in use.');
      process.exit(1);
    } else {
      console.log(err);
    }

});

// allows authenticated cross domain requests
preflightEnabler(app);

// function to retrieve the session secret from the database
// checks for existing or creates one if none available
// avoids having to hardcode one in configuration and allows multiple
// servers to share the key
SessionKey = mongoose.model('SessionKey');
var sessionKey;
SessionKey.findOne({ key: /./ }, function (err, sessionKeyResult) {
  if (!err) {
    if (!sessionKeyResult) {
      // No key found, so create and store
      console.log('Setting up a new session key.');
      sessionKey = new SessionKey();
      sessionKey.key = (new mongoose.Types.ObjectId()).toString();
      sessionKey.save();
    } else {
      // use key founf in the database
      console.log('Retrieved session key from db.');
      sessionKey = sessionKeyResult;
    }

    // because we can't have a synchronous DB call, finish up the server setup here
    // restify settings
    require(config_path + '/restify-server')(app, config, sessionKey.key);

    // configure email
    var MailHelper = require(config_path + '/mail-helper.js').MailHelper;

    require(config_path + '/routes')(app, config, auth, new MailHelper(config));

    // configure Socket Server
    var SocketHelper_IO = require(config_path + '/socket-helper-socket-io.js').SocketHelper;
    new SocketHelper_IO(app, config);

    // Start the app by listening on <port>
    var port = process.env.PORT || config.port;

    app.listen(port);
    console.log('App started on port ' + port);

  } else {
    console.log("Failed to start server due to database issue.");
    console.log(err);
  }
});







