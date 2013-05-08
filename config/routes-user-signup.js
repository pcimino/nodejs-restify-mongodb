// Routes for the user signup flow:
// - User creates initial information
// - Email sent with verification code
// - Verification code sets email to validated state
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
     console.log(req.url);
     //console.log(req.protocol);
     //console.log(req.host);
     //console.log(req.port);
     console.log(req.getPath());
     console.log(req.params);
      var user = new User(req.params);
      if (user.username != null && user.username != '') {
         user.save(function (err, user) {
            if (!err) {
              // create a verification code
              generateVerifyCode(req, res, next, user);
            } else {
               return next(err);
            }
         });
      } else {
         return next(new restify.MissingParameterError('Username required.'));
      }
   }
// http://stackoverflow.com/questions/6287297/reading-content-from-url-with-node-js
  //http://expressjs.com/api.html#req.params

  // create the verification code and send the email
   function generateVerifyCode(req, res, next, user) {
     var verifyCode = new VerifyCode();
     verifyCode.userObjectId = user._id;
     verifyCode.key = (new ObjectId()).toString();
     verifyCode.save(function (err, user) {
       if (!err) {
         // create a verification code
         var fullURL = 'test';//req.protocol + "://" + req.host + ":" + req.port + req.path + "?v=" + verifyCode.key;
         var messageBody = "Welcome " + user.name + ",</br><p>Please click the link to validate your email address and activate your account.</p>";
         messageBody = messageBody + "<a href='" + fullURL + "'>Activate your account</a>"
console.log("Email " + messageBody);
         mail.sendMail(user.email, 'Account Validation Email', messageBody, true);
         res.send(user);
         return next();
       } else {
         return next(err);
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

   // Set up routes

   // I looked at versioning via header. Lots of arguments pro/con regarding different types of versioning
   // I like the embedded version (self documenting) so stuck with that instead
   // apt.get({path: 'api/user:id', version: '1.0.0'}, getUser_V1);
   // apt.get({path: 'api/user:id', version: '2.0.0'}, getUser_V2);


   // Create
   app.post('api/v1/user', postUser);

   // Read
   app.get('/api/v1/user/username/exists', checkUsername);

}
