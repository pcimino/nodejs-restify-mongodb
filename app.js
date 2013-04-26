// Modules
var restify = require("restify")
  , mongoose = require('mongoose')
  , fs = require('fs')
  , path = require('path');

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
  
// email settings
var nodemailer = require('nodemailer');

if (!config) throw "No email options provided, some are required"; 
if (!config.mailSettings.mailService) throw "Service required";
if (!config.mailSettings.mailAuth) throw "Authorization required";
var transport = {};
if (config.mailSettings.sendEmail) {
    transport = nodemailer.createTransport("SMTP",{
        service: config.mailSettings.mailService,
        auth: config.mailSettings.mailAuth
    });
} else {
    // For email previews
    require('mail-preview');
    var tmpdir = path.join(__dirname, 'tmp', 'nodemailer');

     transport = nodemailer.createTransport('MailPreview', {
       dir: tmpdir,  // defaults to ./tmp/nodemailer
       browser: config.mailSettings.browserPreview // open sent email in browser (mac only, defaults to true)
     });
}

// Bootstrap routes
var auth = require(config_path + '/middlewares/authorization.js');

require(config_path + '/routes')(app, config, auth, transport);

// Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
console.log('App started on port ' + port);
