
/**
 * Module dependencies.
 */

var restify = require('restify')
   , mongoose = require('mongoose')
   , clientSessions = require("client-sessions");

module.exports = function (app, config, sessionKey) {

   app.use(restify.acceptParser(app.acceptable));
   app.use(restify.authorizationParser());
   app.use(restify.dateParser());
   app.use(restify.queryParser());
   app.use(restify.jsonp());
   app.use(restify.gzipResponse());
   app.use(restify.bodyParser());

   // Cross domain? Need to verify if this is required for this app
   // http://stackoverflow.com/questions/14338683/how-can-i-support-cors-when-using-restify
   app.use(restify.CORS());
   app.use(restify.fullResponse());


   // TODO duration doesn't seem to do anything
   app.use(clientSessions({
     cookieName: 'session',    // defaults to session_state
     secret: sessionKey,
     // true session duration:
     // will expire after duration (ms)
     // from last session.reset() or
     // initial cookie.
     duration: config.session_timeout, // defaults to 20 minutes, in ms
     // refresh every access
     path: '/',
     httpOnly: true, // defaults to true
     secure: false   // defaults to false
   }));

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
}
