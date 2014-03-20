
/**
* Routes module for parsing requests
*/
var restify = require('restify')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , config = require('./config').get()
  , config_path = config.root + '/config'
  , auth = require(config_path + '/middlewares/authorization.js');

module.exports = function (app, smtpTransport) {
    var config_path = config.root + '/config';

    /**
     * Pre handler filters and modifies (if required) the incoming requests
     *
     * @param path
     * @param request
     * @param response
     * @param next method in chain
     */
     app.pre(function(req, res, next) {
       if (req.url === '/') {
         req.url = '/public';
       }
       if (req.url === '/public') {
         req.url = '/public/index.html';
       }
       return next();
     });

    /**
     * get static content
     * All GETs to /public return resources (i.e. images)
     *
     *       This is the suggested way with restify, not sure why it doesn't work:
     *          restify.serveStatic({directory: config.root + '/public'});
     *
     * @param path
     * @param request
     * @param response
     */
    app.get(/\/public\/?.*/, function (req, res) {
      var fileStream = fs.createReadStream(config.root + req.url);
      fileStream.on('data', function (data) {
        res.write(data);
      });
      fileStream.on('end', function() {
        res.end();
      });
    });
//TODO fstream.pipe(res)
  // res.send
    /**
     * Ping the API server
     * Kind of pointless since the server has to be up to even respond, but demonstrates most basic API
     *
     * @param path
     * @param request
     * @param response
     */
    app.get('/api', function (req, res) {
      res.send({'message':'Success'});
    });



    /**
     * Ping the Database server
     * A little more useful than the ping API
     *
     * I looked at header based API versioning, not a fan, but also when I tried this, the atatic resource GETs hang
     *   app.get({path : '/db', version : '1.0.0'}, ...
     *   app.get({path : '/db', version : '2.0.0'}, ...
     *
     * @param path
     * @param request
     * @param response
     */
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

    // load the remaining paths, broken up (somewhat) by functionality)
    require(config_path + '/routes-user.js')(app, smtpTransport);
    require(config_path + '/routes-user-signup.js')(app, smtpTransport);

    require(config_path + '/routes-email.js')(app, smtpTransport);
    require(config_path + '/routes-auth.js')(app);

    require(config_path + '/routes-messaging.js')(app, config, auth);
    require(config_path + '/routes-terms-and-conditions.js')(app, smtpTransport);
    require(config_path + '/routes-beta-test-mode.js')(app, smtpTransport);

};





