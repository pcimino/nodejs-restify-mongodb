/**
* Routes module for authorized (secured) access
*/
var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , VerifyCode = mongoose.model('VerifyCode')
  , restify = require('restify')
  , clientSessions = require("client-sessions");

module.exports = function (app, config, auth) {
  /**
   * Return a list of available Roles
   * Must match what's defined in the User.js object
   *
   * Used to restrict access to APIs based on Role for authenticated users
   *
   * User vs. Subscriber: Conceptually used for a free versus paying customer
   *
   * @param request
   * @param response
   * @param next method
   */
   function roles(req, res, next) {
      res.send(['User', 'Subscriber','Admin']);
   }

  /**
   * User logs in using username
   * if new email is blank and email not validated, user cannot login
   *
   * @param request
   * @param response
   * @param next method
   */
   function login(req, res, next) {
      // login with username or email, email could be in the username field if the UI only has one input field
      var queryVal = req.params.username;
      if (!queryVal || queryVal.length === 0) {
          queryVal = req.params.email;
      }
      if (queryVal) {
          var queryObj;
          if (!config.usernameOrPassword) {
            queryObj = {$or :[{'username': new RegExp('^'+queryVal+'$', 'i')}, {'email': new RegExp('^'+queryVal+'$', 'i')}]};
          } else {
            queryObj = {'username': new RegExp('^'+queryVal+'$', 'i')};
          }
          User.findOne(queryObj, function (err, user) {
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
      } else {
        return next(new restify.MissingParameterError('Username or email address required.'));
      }
   }

  /**
   * User logs out
   *
   * @param request
   * @param response
   * @param next method
   */
   function logout(req, res, next) {
      req.session.reset();
      res.send({});
   }


   var VERIFY_EMAIL_SUCCESS = "Your email has been successfully validated.";
   var VERIFY_ACCTL_SUCCESS = "Your account has been successfully validated.";
   var VERIFY_FAIL = "Sorry. We can not validate this account/email. Please try requesting a new code.";


  /**
   * Request includes a verification code to authenticate an email address
   *
   * @param request
   * @param response
   * @param next method
   */
   function verifyCode(req, res, next) {
     var query = VerifyCode.where( 'key', new RegExp('^'+req.params.v+'$', 'i') );
      query.findOne(function (err, verifyCode) {
        if (!err && verifyCode) {
          updateUserEmailStatus(req, res, next, verifyCode);
        } else {
          return next(new restify.NotAuthorizedError(VERIFY_FAIL));
        }
      });
   }

  /**
   * Helper method that updates the database with the user's email status
   * This sets the user's email flag validated=true
   *
   * @param request
   * @param response
   * @param next method
   * @param next{Object} instance of VerifyCode
   */
   function updateUserEmailStatus(req, res, next, verifyCode) {
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
                  var errObj = err;
                  if (err.message) {
                    errObj = err.message;
                  } else {
                    errObj = err.err;
                  }
                  return next(new restify.InternalError(errObj));
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
   }

   // Set up routes

   /**
   * Ping but with user authentication
   *
   * @param path
   * @param promised callback
   * @param request
   * @param response
   */
   app.get('/api/auth', auth.requiresLogin, function (req, res) {
      res.send({'message':'Success'});
   });

   /**
   * Login request
   *
   * @param path
   * @param promised callback
   */
   app.post('/api/v1/session/login', login);

   /**
   * Logout request
   *
   * @param path
   * @param promised callback
   */
   app.get('/api/v1/session/logout', logout);

   /**
   * Get the available roles
   *
   * @param path
   * @param promised callback
   */
   app.get('/api/v1/roles', roles);

   /**
   * User clicked on the verification link
   *
   * @param path
   * @param promised callback
   */
   app.get('/api/v1/verify', verifyCode);

  /**
   * Check user access
   *
   * @param path
   * @param promised callback
   * @param request
   * @param response
   */
   app.get('/api/v1/roles/access', auth.access, function (req, res) {
      res.send({'message':'Success'});
   });
}



