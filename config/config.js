
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
      socket_loglevel: '1', // 0 - error, 1 - warn, 2 - info, 3 - debug
      mailSettings : {
          mailFrom: 'test@gmail.com',
          mailService: "Gmail",
          mailAuth: {user: "test@gmail.com", pass: "testpass"},
          sendEmail: false,
          browserPreview: true
      },
	  version: '1.0.0',
	  // TODO wiring in Passport, although tried a couple of times, probably
      // need to go to Express to get Passport to work correctly
	  facebook: {
          clientID: "APP_ID"
        , clientSecret: "APP_SECRET"
        , callbackURL: "http://localhost:3000/auth/facebook/callback"
      },
      twitter: {
          clientID: "CONSUMER_KEY"
        , clientSecret: "CONSUMER_SECRET"
        , callbackURL: "http://localhost:3000/auth/twitter/callback"
      },
      github: {
          clientID: 'APP_ID'
        , clientSecret: 'APP_SECRET'
        , callbackURL: 'http://localhost:3000/auth/github/callback'
      },
      google: {
          clientID: "APP_ID"
        , clientSecret: "APP_SECRET"
        , callbackURL: "http://localhost:3000/auth/google/callback"
      }
    }
  , test: {

    }
  , production: {

    }
}
