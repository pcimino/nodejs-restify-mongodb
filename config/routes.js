
var restify = require('restify')
  , fs = require('fs')
  , mongoose = require('mongoose');

module.exports = function (app, config, auth, smtpTransport) {
   var config_path = config.root + '/config'

   app.pre(function(req, res, next) {
      if (req.url === '/') {
         req.url = '/public';
      }
      if (req.url === '/public') {
         req.url = '/public/index.html';
      }
      req.headers.accept = 'application/json';
      return next();
   });

   // get static content
   // This is the suggested way with restify, not sure why it doesn't work: restify.serveStatic({directory: config.root + '/public'});
   app.get(/\/public\/?.*/, function (req, res) {
      var fileStream = fs.createReadStream(config.root + req.url);
      fileStream.on('data', function (data) {
         res.write(data);
      });
      fileStream.on('end', function() {
         res.end();
      });
   });

   // Is application alive ping
   app.get('/api', function (req, res) {
      res.send({'message':'Success'});
   });
   
      //
   // I looked at header based API versioning, not a fan, but also when I tried this, the atatic resource GETs hang
   //    app.get({path : '/db', version : '1.0.0'}, ...
   //    app.get({path : '/db', version : '2.0.0'}, ...
   
   // Is database alive ping
   app.get('/db', function (req, res) {
      var result = '';
      mongoose.connection.db.executeDbCommand({'ping':'1'}, function(err, dbres) {
         if (err === null) {
            res.send(dbres);
         } else {
            res.send(err);
         }
      }); 
   });
   
   require(config_path + '/routes-user.js')(app, config, smtpTransport);
   require(config_path + '/routes-auth.js')(app, config, auth)

}
