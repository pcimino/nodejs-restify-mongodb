// Routes for the user signup flow:
// - User creates initial information
// - Email sent with verification code
// - Verification code sets email to validated state
// http://mcavage.github.io/node-restify/#Content-Negotiation
var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , VerifyCode = mongoose.model('VerifyCode')
  , restify = require('restify')
  , ObjectId = mongoose.Types.ObjectId;

var mail = {};

module.exports = function (app, config, mailHelper) {
   mail = mailHelper;

   // Create a new user model, fill it up and save it to Mongodb
   function postUser(req, res, next) {
     if (req.params.password != req.params.vPassword) {
       return next(new restify.MissingParameterError('Password and Verify Password must match.'));
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

  // User needs verification code resent (account or email)
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
            return next();
         }

      });
   }


   // Search for existing username
   // based on this post
   //    https://fabianosoriani.wordpress.com/2012/03/22/mongoose-validate-unique-field-insensitive/
   // I probably should be using the validator the way it's demonstratated but for now I'm just borrowing the query
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
              return next(new restify.InternalError(err));
            }
         });
      } else {
         return next(new restify.MissingParameterError('Username required.'));
      }
   }


  // User needs a new password
   function sendNewPassword(req, res, next) {
     var newPass = makePassword();
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
  function makePassword()
  {
      var text = "";
      var possible = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefhjlxyz2456789";

      for( var i=0; i < 10; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  }
   // Set up routes

   // I looked at versioning via header. Lots of arguments pro/con regarding different types of versioning
   // I like the embedded version (self documenting) so stuck with that instead
   // apt.get({path: 'api/user:id', version: '1.0.0'}, getUser_V1);
   // apt.get({path: 'api/user:id', version: '2.0.0'}, getUser_V2);


   // Create
   app.post('/api/v1/user', postUser);

   // Read
   app.get('/api/v1/user/username/exists', checkUsername);

   // API-wise this makes more sense in routes-auth.js, but functionally it works better here
   // maybe put common JS in a require('utility') module?
   // resend the verify link
   app.get('/api/v1/verify/resend', resendVerifyCode);

   // setup temp password
   app.get('/api/v1/password/sendNew', sendNewPassword);

}
