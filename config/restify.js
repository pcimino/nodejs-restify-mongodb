
/**
 * Module dependencies.
 */

var restify = require('restify')
   , mongoose = require('mongoose')
   , SessionKey = mongoose.model('SessionKey')
   , clientSessions = require("client-sessions");

module.exports = function (app, config) {
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

   //new Buffer("Hello World").toString('base64')
   //findOne SessionKey
   // if not found create one and use it's key
   
   app.use(clientSessions({
      cookieName: 'session',    // defaults to session_state
      secret: (new mongoose.Types.ObjectId()).toString(),
      // true session duration:
      // will expire after duration (ms)
      // from last session.reset() or
      // initial cookieing.
      duration: 24 * 60 * 60 * 1000, // defaults to 1 day
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
