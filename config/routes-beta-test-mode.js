/**
* Beta test Routes Module
*   Requires authenticated users
*/
var mongoose = require('mongoose')
  , Beta = mongoose.model('Beta')
  , BetaInvite = mongoose.model('BetaInvite')
  , User = mongoose.model('User')
  , ObjectId = mongoose.Types.ObjectId
  , restify = require('restify');

var mail = {};

module.exports = function (app, config, auth, mailHelper) {
    mail = mailHelper;

    /**
     * Post a a Beta Invite
     *
     * @param request include email
     * @param response
     * @param next method
     */
    function postBetaInvite(req, res, next) {
       var email = req.params.email;
       if (!mail.validateEmail(email)) {
         return next(new restify.MissingParameterError('Please enter a valid email address.'));
       }

       // generate code and email it
       mail.generateBetaCode(req, res, next, email);
       return next();
    }

    /**
     * Put (Update) Beta status
     * @param request includes 'status' true or false
     * @param response
     * @param next method
     */
    function putBetaStatus(req, res, next) {
      var status = req.params.status;
      if (status != undefined) {
        // clean up the collection, only need one element
        Beta.remove(function (removeErr) {
          if (!removeErr) {
            var beta = new Beta();
            beta.status = status;
            beta.save(function (err, beta) {
              if (!err) {
                if (status == true) {
                  res.send({message:'Beta mode is ON', status:status});
                } else {
                  res.send({message:'Beta mode is OFF', status:status});
                }
                return next();
              } else {
                return next(err);
              }
            });
          } else {
            return next(removeErr);
          }
        });
      }
    }

    /**
     * Get a Beta status
     *
     * @param request
     * @param response 'status' true or false, unless a code is provided, then return the betaInvite object
     * @param next method
     */
    function getBetaStatus(req, res, next) {
      var code = req.params.betaCode;
      if (code) {
        // return email or throw exception
        BetaInvite.findOne({betaCode:code}, function (err, betaInvite) {
          if (!err) {
            res.send(betaInvite);
            return next();
          } else {
            return next(err);
          }
        });
      } else {
        // simply return the status
        Beta.findOne({}, function (err, beta) {
          if (!err) {
            var statusFlag = false;
            if (beta) {
              statusFlag = beta.status;
            }
            res.send({status:statusFlag});
            return next();
          } else {
            return next(err);
          }
        });
      }
    }

    /**
     * Delete a Beta Code
     *
     * @param request
     * @param response 'status' true or false
     * @param next method
     */
    function deleteBetaInvite(req, res, next) {
      var code = req.params.betaCode;
      if (code) {
        // remove the code
        BetaInvite.findOne({betaCode:code}).remove(function (err) {
          if (!err) {
            return next();
          } else {
            return next(err);
          }
        });
      }
    }

    /**
     * Post a Beta Invite
     *
     * @param path
     * @param promised callback check admin access
     * @param promised 2nd callback post
     */
    app.post('/api/v1/beta', auth.adminAccess, postBetaInvite);

    /**
     * Turn beta mode on/off using 'status'
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.put('/api/v1/beta', auth.adminAccess, putBetaStatus);

    /**
     * Get a Beta status, if betaCode is included return registered email or throw exception
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.get('/api/v1/beta', getBetaStatus);

    /**
     * clear a used betaCode
     *
     * @param path
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.del('/api/v1/beta', auth.requiresLogin, deleteBetaInvite);


}































