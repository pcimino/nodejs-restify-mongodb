/**
 * Module dependencies.
 */

var restify = require('restify')
   , mongoose = require('mongoose')
   , clientSessions = require("client-sessions")
   , longjohn = require("longjohn")
   , config = require('./config').get()
   , config_path = config.root + '/config';


module.exports = function (app, sessionKey) {

   longjohn.async_trace_limit = 5;  // defaults to 10
   longjohn.empty_frame = 'ASYNC CALLBACK';

   app.use(restify.acceptParser(app.acceptable));
   app.use(restify.authorizationParser());
   app.use(restify.dateParser());
   app.use(restify.queryParser());
   app.use(restify.jsonp());
   app.use(restify.gzipResponse());
   app.use(restify.bodyParser());

   var os = require('os');
   console.log(os.platform() + ", " + os.release());
   // having issues on WIndows with nodegyp and toobusy, Windows SDK solution works on some platforms
   // https://github.com/TooTallNate/node-gyp/#installation
   if (os.platform().indexOf('win') < 0) {
     console.log("Loading toobusy");
     // send a 503 if the server is too busy
     var toobusy = require('toobusy')
     app.use(function(req, res, next) {
      if (toobusy()) {
        res.send(503, "I'm busy right now, sorry.");
      } else {
        next();
      }
     });
   }

   app.use(clientSessions({
     cookieName: 'session'    // defaults to session_state
     , secret: sessionKey
     , duration: config.session_timeout // in ms
     // refresh every access through the api
     , path: '/api'
     , httpOnly: true // defaults to true
     , secure: false   // defaults to false
     , cookie: {
         maxAge: config.session_timeout
         , ephemeral: config.ephemeral_cookie
     }
   }));

   // client-sessions documentation is "correct", but the devs added a work around to the cookie expiry problem
   app.use(function(req, res, next) {
     if (req.session) {
       req.session.setDuration(config.session_timeout);
     }
     next();
   });


    app.use(restify.throttle({
      burst: 100,
      rate: 50,
      ip: true,
      overrides: {
        '192.168.1.1': {
           rate: 0,        // unlimited
           burst: 0
         }
      }
    }));
   app.use(restify.conditionalRequest());
};



