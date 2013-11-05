/**
* Authorization middleware module
*/
var restify = require('restify')
   , mongoose = require('mongoose')
   , User = mongoose.model('User')
   , range_check = require('range_check');

var config = {};

/**
* Set config
* TODO Need to refactor this into one Export with methods and pass the config into the require('authorization.js')(config)
*
* @param config
*/
exports.setConfig = function(appConfig) {
  config = appConfig;
}

/**
 * checks for client session
 *
 * @param request
 * @param response
 * @param next method
 */
exports.requiresLogin = function(req, res, next) {
   var id = "-1";
   if (req.session && req.session.user) {
      id = req.session.user;
   }
   User.findById(id, function (err, user) {
      if (!err) {
         if (user) {
            return next({});
         } else {
            return next(new restify.NotAuthorizedError("Access restricted."));
         }
      } else {
         return next(new restify.NotAuthorizedError("Access restricted."));
      }
   });
};

/**
 * This method is really for testing, the front end should never determine
 * Role access, restrict APIs with the explicit access methods.
 *
 * compares user access role to request parameter
 *
 * @param request
 * @param response
 * @param next method
 */
exports.access = function(req, res, next) {
   var id = "-1";
   if (req.session && req.session.user) {
      id = req.session.user;
   }
   User.findById(id, function (err, user) {
      if (!err) {
         if (user && user.allowAccess(req.params.role)) {
            return next({});
         } else {
            return next(new restify.NotAuthorizedError("Access restricted."));
         }
      } else {
         return next(new restify.NotAuthorizedError("Access restricted."));
      }
   });
};

/**
 * Checks if the logged in user has admin access
 *
 * @param request
 * @param response
 * @param next method
 */
exports.adminAccess = function(req, res, next) {
  if (config.ipRangeCheckFlag) {
   // check for IP Range
   if (!range_check.in_range(req.connection.remoteAddress, config.adminIPRange)) {
     console.log("IP Address " + req.connection.remoteAddress + " is not within the allowed range(s).")
     return next(new restify.NotAuthorizedError("Access restricted."));
   }
   var id = "-1";
   if (req.session && req.session.user) {
      id = req.session.user;
   }
   User.findById(id, function (err, user) {
      if (!err) {
         if (user && !user.allowAccess('Admin')) {
            return next({});
         } else {
            return next(new restify.NotAuthorizedError("Access restricted."));
         }
      } else {
         return next(new restify.NotAuthorizedError("Access restricted."));
      }
   });
  } else {
    return next();
  }
};


/**
 * Checks if the logged in user has subscriber access
 *
 * @param request
 * @param response
 * @param next method
 */
exports.subscriberAccess = function(req, res, next) {
   var id = "-1";
   if (req.session && req.session.user) {
      id = req.session.user;
   }
   User.findById(id, function (err, user) {
      if (!err) {
         if (user && user.allowAccess('Subscriber')) {
            return next({});
         } else {
            return next(new restify.NotAuthorizedError("Access restricted."));
         }
      } else {
         return next(new restify.NotAuthorizedError("Access restricted."));
      }
   });
};


