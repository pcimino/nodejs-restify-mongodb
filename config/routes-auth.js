var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , restify = require('restify');

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
         }
         if (!user) {
            res.send({ message: 'Unknown user' })
         }
         if (!user.emailValidatedFlag && user.newEmail != '') {
           // user account has never been validated
           req.session.reset();
           res.send({ message: 'Email address must be validated to activate your account.' })
         }
         if (user.authenticate(req.params.password)) {
            req.session.user = user._id;
			      res.send(user);
         } else {
			      req.session.reset();
            res.send({ message: 'Invalid password.' })
         }
		 return next();
      });
   }

   function logout(req, res, next) {
      req.session.reset();
      res.send({});
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

   // Check user access
   app.get('/api/v1/roles/access', auth.access, function (req, res) {
      res.send({'message':'Success'});
   });
}

