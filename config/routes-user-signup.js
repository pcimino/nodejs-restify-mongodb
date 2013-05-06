// NOTE : All of these routes are exposed (unprotected) See routes-auth.js for examples of authorized routes

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , UserList = mongoose.model('UserList')
  , restify = require('restify');

var mail = {};

module.exports = function (app, config, mailHelper) {
   mail = mailHelper;

   // Create a new user model, fill it up and save it to Mongodb
   function postUser(req, res, next) {
      var user = new User(req.params);
      if (user.username != null && user.username != '') {
         user.save(function (err, user) {
            if (!err) {
              mail.sendMail(user.email, 'test subject', 'test text', true);
               res.send(user);
               return next();
            } else {
               return next(err);
            }
         });
      } else {
         return next(new restify.MissingParameterError('Username required.'));
      }
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
