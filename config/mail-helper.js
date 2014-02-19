/**
* Wrapper functionality for sendmail
*/
var path = require('path')
    , nodemailer = require('nodemailer')
    , mongoose = require('mongoose')
    , User = mongoose.model('User')
    , VerifyCode = mongoose.model('VerifyCode')
    , BetaInvite = mongoose.model('BetaInvite')
    , ObjectId = mongoose.Types.ObjectId;


// create reusable transports
var transport = null;
var transportErrorLog = null; // this uses preview to save failed emails to a directory

// setup e-mail data with unicode symbols
var mailOptions = {
  from: "", // sender address
  to: "", // list of receivers
  subject: "", // Subject line
  text: "", // plaintext body
  html: "", // html body
  service: {},
  auth: {},
  sendEmail: false,
  previewDir: '../mailLog/testPreview',
  errDir: '../mailLog/error'
}

/**
 * Helper method available to the MailHelper module
 *
 * @param {String} recipient
 * @param {String} subject
 * @param {String} body
 * @param {Boolean} htmlFlag
 */
function sendMailHelper(recipient, subject, body, htmlFlag) {
  if (null === transport) {
    createTransport();
  }
  var sendOptions = {};

  sendOptions.mailFrom = mailOptions.mailFrom;
  sendOptions.to = recipient;
  sendOptions.subject = subject;
  if (true == htmlFlag) {
    sendOptions.html = body;
  } else {
    sendOptions.text = body;
  }
  transport.sendMail(sendOptions, function(error, response) {
    if (error) {
      console.log('sendMail ' + error);
      // email failed, send to the error log directory
      transportErrorLog.sendMail(sendOptions);
    } else {
      if (response) console.log("Message sent: " + JSON.stringify(response));
    }
  });
};

/**
 * Create the transports
 * There are 2 transports, the primary, and the secondary which saves failed emails
 */
function createTransport() {
  if (null != transport) {
    closeConnection();
  }
  require('mail-preview');
  if (true == mailOptions.sendEmail) {
    transport = nodemailer.createTransport("SMTP",{
      service: mailOptions.service,
      auth: mailOptions.auth
    });
  } else {
    // For email previews
    var tmpdir = path.join(__dirname, mailOptions.previewDir, 'nodemailer');

    transport = nodemailer.createTransport('MailPreview', {
      dir: tmpdir,  // defaults to ./tmp/nodemailer
      browser: mailOptions.browserPreview // open sent email in browser
    });
  }
  // For email error logging
  var tmpErr = path.join(__dirname, mailOptions.errDir, 'nodemailer');
  transportErrorLog = nodemailer.createTransport('MailPreview', {
    dir: tmpErr,  // defaults to ./tmp/nodemailer
    browser: mailOptions.browserPreview // open sent email in browser
  });
};

/**
 * Close the connections
 */
function closeConnection() {
  if (null != transport) {
    transport.close(); // shut down the connection pool, no more messages
  }
  transport = null;

  if (null != transportErrorLog) {
    transportErrorLog.close(); // shut down the connection pool, no more messages
  }
  transportErrorLog = null;
};

/**
 * Generates a MailHelper object which is the main 'hub' for managing the
 * send process
 *
 * @constructor
 * @param {Object} options Message options object, see README for the complete list of possible options
 */
var MailHelper = function(config) {
  this.initialize(config);
}

/**
 * Initializes properties
 *
 * @constructor
 * @param {Object} options Message options object, see README for the complete list of possible options
 */
MailHelper.prototype.initialize = function(appConfig){
    if (!appConfig.mailSettings) throw "no options provided, some are required";
    if (!appConfig.mailSettings.mailFrom) throw "cannot send email without send address";
    if (!appConfig.mailSettings.mailService && !appConfig.mailSettings.host && !appConfig.mailSettings.port) throw "mailService or host and port are required";
    if (!appConfig.mailSettings.mailAuth) throw "Authorization required";

    mailOptions.from = appConfig.mailFrom;

    mailOptions.service = appConfig.mailSettings.service;
    mailOptions.auth = appConfig.mailSettings.auth;
    mailOptions.sendEmail = appConfig.mailSettings.sendEmail;
    mailOptions.browserPreview = appConfig.mailSettings.browserPreview;

    if (appConfig.mailSettings.previewDir) {
      mailOptions.previewDir = appConfig.mailSettings.previewDir;
    }
    if (appConfig.mailSettings.errDir) {
      mailOptions.errDir = appConfig.mailSettings.errDir;
    }
};



/**
 * Helper method to perform basic email validation
 *
 * @param {String} email
 */
MailHelper.prototype.validateEmail = function(email) {
  var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return filter.test(email);
};


/**
 * Send mail with defined transport object
 *
 * @param recipient email address
 * @param subject
 * @param body
 * @param htmlFlag if true, body is html
 */
MailHelper.prototype.sendMail = function(recipient, subject, body, htmlFlag) {
    sendMailHelper(recipient, subject, body, htmlFlag);
};

/**
 * create the verification code and send the email
 *
 * @param request
 * @param response
 * @param next method
 * @param {Object} instance of a user object
 */
MailHelper.prototype.generateVerifyCode = function(req, res, next, user) {
  var verifyCode = new VerifyCode();
  verifyCode.userObjectId = user._id;
  verifyCode.key = (new ObjectId()).toString();
  verifyCode.save(function (err, verifyCode) {
    if (!err) {
      // create a verification code
      var protocol = req.toString().substring(req.toString().indexOf('referer:')+8).trim();
      var host = req.header('Host');
      protocol = protocol.substring(0, protocol.indexOf("://") + 3);

      var fullURL = protocol + host + "/api/v1/verify?v=" + verifyCode.key;
      var messageBody;
      if (user.newEmail) {
        messageBody = "Welcome " + user.name + ",</br><p>Please click the link to validate your email address.</p>";
        messageBody = messageBody + "<a href='" + fullURL + "' target='_blank'>Validate your email address</a>"
      } else {
        messageBody = "Welcome " + user.name + ",</br><p>Please click the link to activate your account.</p>";
        messageBody = messageBody + "<a href='" + fullURL + "' target='_blank'>Activate your account</a>"
      }
      var mailAddress = user.email;
      if (user.newEmail) {
        mailAddress = user.newEmail;
      }
      sendMailHelper(mailAddress, 'Account Validation Email', messageBody, true);
      return next();
    } else {
      return next(err);
    }
  });
};


/**
 * create the beta code and send the email
 *
 * @param request
 * @param response
 * @param next method
 * @param mailAddress
 */
MailHelper.prototype.generateBetaCode = function(req, res, next, mailAddress) {
  var betaInvite = new BetaInvite();
  betaInvite.email = mailAddress;
  betaInvite.betaCode = globalUtil.generatePassword();
  betaInvite.save(function (err, betaInvite) {
    if (!err) {
      // send the beta invite
      var refer = req.toString().substring(req.toString().indexOf('referer:')+8).trim();
      var referArr = refer.split(/\s+/);
      refer = referArr[0];
      var fullURL = refer + "#/userSignup";
      var messageBody = "Hello,</br><p>Here is your Beta code. Please use it to sign up.</p><p>" + betaInvite.betaCode + "</p>";
      messageBody = messageBody + "<a href='" + fullURL + "' target='_blank'>Create a New Beta user Account Here</a>"

      sendMailHelper(betaInvite.email, 'Beta User Invite', messageBody, true);
      res.send({message:'Beta invite sent to ' + mailAddress})
      return next();
    } else {
      return next(err);
    }
  });
};


/**
 * create the verification code for updated email address
 *
 * @param request
 * @param response
 * @param next method
 * @param {Object} instance of a user object
 */
MailHelper.prototype.generateVerifyCodeUpdatedEmail = function(req, res, next, user) {
  var verifyCode = new VerifyCode();
  verifyCode.userObjectId = user._id;
  verifyCode.key = (new ObjectId()).toString();
  verifyCode.save(function (err, verifyCode) {
    if (!err) {
      // create a verification code
      var protocol = req.toString().substring(req.toString().indexOf('referer:')+8).trim();
      var host = req.header('Host');
      protocol = protocol.substring(0, protocol.indexOf("://") + 3);
      var fullURL = protocol + host + "/api/v1/verify?v=" + verifyCode.key;
      var messageBody = "Hi " + user.name + ",</br><p>Please click the link to validate your new email address.</p>";
      messageBody = messageBody + "<a href='" + fullURL + "' target='_blank'>Activate your account</a>"

      var mailAddress = user.email;
      if (user.newEmail) {
        mailAddress = user.newEmail;
      }
      sendMailHelper(mailAddress, 'Account Validation Email', messageBody, true);
      return next();
    } else {
      return next(err);
    }
  });
};


// Export MailHelper constructor
module.exports.MailHelper = MailHelper;









