/**
* Wrapper functionality for sendmail
*/
var path = require('path')
    , nodemailer = require('nodemailer')
    , mongoose = require('mongoose')
    , User = mongoose.model('User')
    , VerifyCode = mongoose.model('VerifyCode')
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
      console.log(error);
      // email failed, send to the error log directory
      transportErrorLog.sendMail(sendOptions);
    } else {
      if (response) console.log("Message sent: " + response.message);
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
      browser: mailOptions.browserPreview // open sent email in browser (mac only, defaults to true)
    });
  }
  // For email error logging
  var tmpErr = path.join(__dirname, mailOptions.errDir, 'nodemailer');
  transportErrorLog = nodemailer.createTransport('MailPreview', {
    dir: tmpErr,  // defaults to ./tmp/nodemailer
    browser: mailOptions.browserPreview // open sent email in browser (mac only, defaults to true)
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
    if (!appConfig.mailSettings.mailService) throw "Service required";
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
      var refer = req.toString().substring(req.toString().indexOf('referer:')+8).trim();
      var host = req.header('Host');
      refer = refer.substring(0, refer.indexOf(host) + host.length);
      var fullURL = refer + "/api/v1/verify?v=" + verifyCode.key;
      var messageBody = "Welcome " + user.name + ",</br><p>Please click the link to validate your email address and activate your account.</p>";
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
      var refer = req.toString().substring(req.toString().indexOf('referer:')+8).trim();
      var host = req.header('Host');
      refer = refer.substring(0, refer.indexOf(host) + host.length);
      var fullURL = refer + "/api/v1/verify?v=" + verifyCode.key;
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
