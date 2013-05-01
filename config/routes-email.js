// NOTE : All of these routes are exposed (unprotected) See routes-auth.js for examples of authorized routes

var restify = require('restify');

var mail = {};

module.exports = function (app, config, mailHelper) {
   mail = mailHelper;


   // Create a new user model, fill it up and save it to Mongodb
   function postEmail(req, res, next) {
      var to = req.params.to;
      var subject = req.params.subject;
      var message = req.params.message;
      mail.sendMail(to, subject, message, false);
      return next();
   }




   // Set up routes

   // I looked at versioning via header. Lots of arguments pro/con regarding different types of versioning
   // I like the embedded version (self documenting) so stuck with that instead
   // apt.get({path: 'api/user:id', version: '1.0.0'}, getUser_V1);
   // apt.get({path: 'api/user:id', version: '2.0.0'}, getUser_V2);


   // Create
   app.post('api/v1/email', postEmail);

}
