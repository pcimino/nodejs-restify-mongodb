var restify = require('restify')
   , Cookies  = require('Cookies')
   , mongoose = require('mongoose')
   , User = mongoose.model('User');

/*
 *  This is NOT a serious authentication scheme, demo of how you might wire it in
 */

exports.requiresLogin = function(req, res, next) {
   var cookies = new Cookies(req, res);
   var id = cookies.get('session-id');
   User.findById(id, function (err, user) {
      if (!err) {
         if (user && user._id) {
            return next({});
         } else {
            return next(new restify.NotAuthorizedError("Access restricted."));
         }
      } else {
         return next(new restify.NotAuthorizedError("Access restricted."));
      }
   });
};

// See if the user has the allowed access
exports.access = function(req, res, next) {
   var cookies = new Cookies(req, res);
   var id = cookies.get('session-id');
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