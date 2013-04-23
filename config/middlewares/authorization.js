var restify = require('restify')
   , mongoose = require('mongoose')
   , User = mongoose.model('User');

/*
 *  This is NOT a serious authentication scheme, demo of how you might wire it in
 */

exports.requiresLogin = function(req, res, next) {
   var id = "-1";
   if (req.session.user) {
      id = req.session.user;
   }
   User.findById(id, function (err, user) {
      if (!err) {
         if (user && user) {
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
   var id = "-1";
   if (req.session.user) {
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