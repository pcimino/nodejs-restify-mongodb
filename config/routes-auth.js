var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , restify = require('restify')
  , Cookies  = require('Cookies');

module.exports = function (app, config, auth) {
   // Return the available roles
   function roles(req, res, next) {
      res.send(['User', 'Subscriber','Admin']);
   }
   
   // Search by Username
   function login(req, res, next) {
      var query = User.where( 'username', new RegExp('^'+req.params.username+'$', 'i') );
      query.findOne(function (err, user) {
         if (err) { 
            res.send(err); 
         }
         if (!user) {
            res.send({ message: 'Unknown user' })
         }
		// create cookie
	 	// https://github.com/jed/cookies
	 	// This supports expiration date, but not maxAge or last access time
        // docs state default is to expire when session ends, but this doesn't seem to be the case
		var cookies = new Cookies(req, res);
         if (user.authenticate(req.params.password)) {
			var expDate = new Date();
			if (req.body.remember === 1) {
				expDate.setDate(expDate.getDate() + 365);
			} else {
				expDate.setDate(expDate.getDate() + 1);
			}
			cookies.set('session-id', user._id, {expires : expDate, overwrite : true}); 
			res.send(user);
         } else {
			cookies.set('session-id', '', {overwrite : true}); 
            res.send({ message: 'Invalid password' })
         }
		 return next();
      });
   }

   function logout(req, res, next) {
      // create cookie
      var cookies = new Cookies(req, res);
      cookies.set('session-id', '', {overwrite : true}); //https://github.com/jed/cookies
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

