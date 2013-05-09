var restify = require('restify')
   , mongoose = require('mongoose')
   , User = mongoose.model('User');

/*
 *  This is NOT a serious authentication scheme, demo of how you might wire it in
 */

exports.requiresLogin = function(req, res, next) {
  var i = 0;
  console.log(i);i=i+1;
   var id = "-1";
   if (req.session.user) {
     console.log(i);i=i+1;
      id = req.session.user;
   }
  console.log(i);i=i+1;
   User.findById(id, function (err, user) {
     console.log(i);i=i+1;
      if (!err) {
         if (user) {
            return next({});
         } else {
            return next(new restify.NotAuthorizedError("Access restricted."));
         }
      } else {
        console.log(i);i=i+1;
         return next(new restify.NotAuthorizedError("Access restricted."));
      }
   });
};

// See if the user has the allowed access
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

// See if the user has admin allowed access
exports.adminAccess = function(req, res, next) {
   var id = "-1";
   if (req.session.user) {
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

// See if the user has subscriber access
exports.subscriberAccess = function(req, res, next) {
   var id = "-1";
   if (req.session.user) {
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