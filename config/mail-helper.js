var path = require('path')
    , nodemailer = require('nodemailer');

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
    sendEmail: false
}

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
    mailOptions.browserPreview = appConfig.mailSettings.browserPreview
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
  console.log(1);
    if (null === transport) {
        this.createTransport();
    }
    var sendOptions = {};

    sendOptions.mailFrom = mailOptions.mailFrom;
    sendOptions.to = recipient;
    sendOptions.subject = subject;

    if (true == htmlFlag) {
      console.log(5);
        sendOptions.html = body;
    } else {
      console.log(6);
        sendOptions.text = body;
    }

    transport.sendMail(sendOptions, function(error, response) {
        if (error) {
            console.log(error);
            // email failed, send to the error log directory
            transportErrorLog.sendMail(sendOptions);
        } else {
            // if (response) console.log("Message sent: " + response.message);
        }
    });
};

/**
 * Close the connection
 */
MailHelper.prototype.closeConnection = function() {
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
 * Create the transport
 */
MailHelper.prototype.createTransport = function() {
    if (null != transport) {
        this.closeConnection();
    }
    require('mail-preview');
    if (true == mailOptions.sendEmail) {
        transport = nodemailer.createTransport("SMTP",{
            service: mailOptions.service,
            auth: mailOptions.auth
        });
    } else {
        // For email previews
        var tmpdir = path.join(__dirname, 'tmp', 'nodemailer');

        transport = nodemailer.createTransport('MailPreview', {
            dir: tmpdir,  // defaults to ./tmp/nodemailer
            browser: mailOptions.browserPreview // open sent email in browser (mac only, defaults to true)
        });
    }

    // For email error logging
    var tmpErr = path.join(__dirname, 'emailErr', 'nodemailer');

    transportErrorLog = nodemailer.createTransport('MailPreview', {
        dir: tmpErr,  // defaults to ./tmp/nodemailer
        browser: mailOptions.browserPreview // open sent email in browser (mac only, defaults to true)
    });
}

// Export MailHelper constructor
module.exports.MailHelper = MailHelper;