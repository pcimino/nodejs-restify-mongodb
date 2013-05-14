/**
 * Environment dependent configuration properties
 */
module.exports = {
    development: {
      root: require('path').normalize(__dirname + '/..'),
      app: {
        name: 'Nodejs Restify Mongoose Demo'
      },
	    host: 'localhost',
	    port: '3000',
	    db_prefix: 'mongodb',
	    db_port: '27017',
	    db_database: 'test_database',
      session_timeout: 1200000, // defaults to 20 minutes, in ms (20 * 60 * 1000)
      socket_loglevel: '1', // 0 - error, 1 - warn, 2 - info, 3 - debug
      mailSettings : {
          mailFrom: 'test@gmail.com',
          mailService: "Gmail",
          mailAuth: {user: "test@gmail.com", pass: "testpass"},
          sendEmail: false,
          browserPreview: true
      },
	    version: '1.0.0'
    }
  , test: {

    }
  , production: {

    }
}
