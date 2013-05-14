var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , VerifyCode = mongoose.model('VerifyCode')
  , restify = require('restify')
  , clientSessions = require("client-sessions");

module.exports = function (app, config, auth) {
   // Return the available roles
   function roles(req, res, next) {
      res.send(['User', 'Subscriber','Admin']);
   }

   // Search by Username
   // User logs in
   // if new email is blank and email not validated, user cannot login
   function login(req, res, next) {
      var query = User.where( 'username', new RegExp('^'+req.params.username+'$', 'i') );
      query.findOne(function (err, user) {
         if (err) {
            res.send(err);
           return next();
         } else if (!user) {
            return next(new restify.NotAuthorizedError("Invalid username."));
           return next();
         } else if (user.authenticate(req.params.password)) {
          if (!user.emailValidatedFlag && !user.newEmail) {
             // user account has never been validated
             return next(new restify.NotAuthorizedError("Email address must be validated to activate your account."));
           } else {
             req.session.user = user._id; //subscriber@subscriber
			       res.send(user);
             return next();
           }
         } else {
			      return next(new restify.NotAuthorizedError("Invalid password."));
         }

      });
   }

   function logout(req, res, next) {
      req.session.reset();
      res.send({});
   }


   var VERIFY_EMAIL_SUCCESS = "Your email has been successfully validated.";
   var VERIFY_ACCTL_SUCCESS = "Your account has been successfully validated.";
   var VERIFY_FAIL = "Sorry. We can not validate this account/email. Please try requesting a new code.";

  // should probably return a file formt he /public directory on success/fail
   function verifyCode(req, res, next) {
     var query = VerifyCode.where( 'key', new RegExp('^'+req.params.v+'$', 'i') );
      query.findOne(function (err, verifyCode) {
        if (!err && verifyCode) {
          validateCode(req, res, next, verifyCode);
        } else {
          return next(new restify.NotAuthorizedError(VERIFY_FAIL));
        }
      });
   }

   function validateCode(req, res, next, verifyCode) {
      User.findById(verifyCode.userObjectId, function (err, user) {
      var successMsg = VERIFY_ACCTL_SUCCESS;
        if (!err && user) {
          if (user.newEmail) {
            user.email = user.newEmail;
            user.newEmail = '';
            user.emailValidatedFlag = true;
            successMsg = VERIFY_EMAIL_SUCCESS;
          }
          user.emailValidatedFlag = true;
          user.save(function (err) {
            if (err) {
              if (err.message) {
                return next(new restify.InternalError(err.message));
              } else {
                return next(new restify.InternalError(err));
              }
            } else {
              // clean up all verification codes
              VerifyCode.remove({userObjectId: user._id}, function(err){});

              res.send(successMsg);
              return next();
            }
          });
        } else {
          return next(new restify.NotAuthorizedError(VERIFY_FAIL));
        }
      });
		 //return next();
   }

   // Set up routes

   // Ping but with user authentication
   app.get('/api/auth', auth.requiresLogin, function (req, res) {
      res.send({'message':'Success'});
   });

   // Login
   app.post('/api/v1/session/login', login);
   // Logout
   app.get('/api/v1/session/logout', logout);

   // Get the available roles
   app.get('/api/v1/roles', roles);

   // Get the verify a code a link
   app.get('/api/v1/verify', verifyCode);

  // Check user access
   app.get('/api/v1/roles/access', auth.access, function (req, res) {
      res.send({'message':'Success'});
   });
}
