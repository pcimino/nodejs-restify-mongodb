
/**
* Email Routes module
*    Requires authenticated users
*/
var restify = require('restify');
var mail = {};

module.exports = function (app, config, auth, mailHelper) {
   mail = mailHelper;

  /**
   * Send an email, this function is more for testing than anything else
   *
   * @param request
   * @param response
   * @param next method
   */
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


   /**
   * Create an email
   *
   * @param path {to:'email destination', 'subject:'<subject>',message'<text>'}
   * @param promised callback
   * @param promised 2nd callback
   */
   app.post('/api/v1/email', auth.requiresLogin, postEmail);

};
