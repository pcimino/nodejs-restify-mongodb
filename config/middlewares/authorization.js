var restify = require('restify')
   , mongoose = require('mongoose')
   , User = mongoose.model('User');

/*
 *  Known issue in client-sessions as of May 2013
 *  if the secret key changes between restarts then the cookie is useless,
 *  what's worse is it tends to blow up the server
 *  https://github.com/mozilla/node-client-sessions/issues/36
 *
 *  Fix is in github but not npm module.
 */

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
           // found that I needed to send the username as well as the Success
           // could send the whole user data, but this would be too much most of the time
           // If the client refreshes, the data in the page clears, but the cookie is still good
           // so check if the session is good, the client is responsible for checking if the data has been cleared, if so
           // reload the user data
           res.send({message: 'Success', username: user.username});
           return({});
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
   var id = "-1";
   if (req.session && req.session.user) {
      id = req.session.user;
   }
   User.findById(id, function (err, user) {
      if (!err) {
         if (user && user.allowAccess('Admin')) {
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
