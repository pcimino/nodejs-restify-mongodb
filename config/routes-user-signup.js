/**
* Routes for the user signup flow:
* - User creates initial information
* - Email sent with verification code
* - Verification code sets email to validated state
*/
// http://mcavage.github.io/node-restify/#Content-Negotiation
var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , VerifyCode = mongoose.model('VerifyCode')
  , restify = require('restify')
  , ObjectId = mongoose.Types.ObjectId;

var mail = {};

module.exports = function (app, config, auth, mailHelper) {
   mail = mailHelper;

  /**
   * Create a new user model, fill it up and save it to Mongodb
   *
   * @param request
   * @param response
   * @param next method
   */
   function postUser(req, res, next) {
     if (req.params.password != req.params.vPassword) {
       return next(new restify.MissingParameterError('Password and Verify Password must match.'));
     }
     if (!mail.validateEmail(req.params.email)) {
       return next(new restify.MissingParameterError('Please enter a valid email address.'));
     }
     var user = new User(req.params);
      if (user.username != null && user.username != '') {
         user.save(function (err, user) {
            if (!err) {
              // create a verification code
              mail.generateVerifyCode(req, res, next, user);
              res.send(user);
            } else {
               return next(err);
            }
         });
      } else {
         return next(new restify.MissingParameterError('Username required.'));
      }
   }

  /**
   * User requests a verification code be resent (account or email)
   *
   * @param request
   * @param response
   * @param next method
   */
   function resendVerifyCode(req, res, next) {
      var query = User.where( 'username', new RegExp('^'+req.params.username+'$', 'i') );
      query.findOne(function (err, user) {
         if (err) {
            res.send(err);
           return next();
         } else if (!user) {
            return next(new restify.NotAuthorizedError("Invalid username."));
            return next();
         } else {
            mail.generateVerifyCode(req, res, next, user);
            res.send(user);
            return next();
         }
      });
   }

  /**
   * Search for existing username
   * https://fabianosoriani.wordpress.com/2012/03/22/mongoose-validate-unique-field-insensitive/
   * @param request
   * @param response
   * @param next method
   */
   function checkUsername(req, res, next) {
      if (req.params.username != null && req.params.username != '') {
         var query = User.where( 'username', new RegExp('^'+req.params.username+'$', 'i') );
         query.count(function(err, count) {
            if (!err) {
               if (count === 0) {
                  res.send({});
                  return next();
               } else {
                  return next(new restify.InternalError('Username already in use.'));
               }
            } else {
              var errObj = err;
              if (err.err) errObj = err.err;
              return next(new restify.InternalError(errObj));
            }
         });
      } else {
         return next(new restify.MissingParameterError('Username required.'));
      }
   }

  /**
   * User requests a new password
   * @param request
   * @param response
   * @param next method
   */
   function sendNewPassword(req, res, next) {
      var newPass = globalUtil.generatePassword();
      var query = User.where( 'username', new RegExp('^'+req.params.username+'$', 'i') );
      query.findOne(function (err, user) {
         if (err) {
            res.send(err);
           return next();
         } else if (!user) {
            return next(new restify.NotAuthorizedError("Invalid username."));
           return next();
         } else {
           user.password = newPass;
           user.tempPasswordFlag = true;
           user.save(function (err, user) {
            if (!err) {
              // send the new password
             var refer = req.toString().substring(req.toString().indexOf('referer:')+8).trim();
             var host = req.header('Host');
             refer = refer.substring(0, refer.indexOf(host) + host.length);
             var fullURL = refer + "/";
             var messageBody = "Hello " + user.name + ",</br><p>Here is your new password. Please login and change it.</p><p>" + newPass + "</p>";
             messageBody = messageBody + "<a href='" + fullURL + "' target='_blank'>Login to your account</a>"

             var mailAddress = user.email;
             mail.sendMail(mailAddress, 'Temporary Password Email', messageBody, true);
             res.send(user);
             return next();
            } else {
               return next(err);
            }
         });
         }

      });
   }

   // Set up routes
   /**
   * reate a user
   *
   * @param path
   * @param promised callback
   */
   app.post('/api/v1/user', postUser);

   /**
   * Search for username
   *
   * @param path
   * @param promised callback
   */
   app.get('/api/v1/user/username/exists', checkUsername);


   /**
   * resend the verification link
   *  API-wise this makes more sense in routes-auth.js, but functionally it works better here
   *  maybe put common JS in a require('utility') module?
   *  resend the verify link
   *
   * @param path
   * @param promised callback
   */
   app.get('/api/v1/verify/resend', resendVerifyCode);

   /**
   * Setup a temporary password
   *
   * @param path
   * @param promised callback
   */
   app.get('/api/v1/password/sendNew', sendNewPassword);

}






