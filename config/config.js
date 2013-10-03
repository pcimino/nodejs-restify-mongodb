/**
 * Environment dependent configuration properties
 */
module.exports = {
    development: {
      root: require('path').normalize(__dirname + '/..')
      , app: {
          name: 'Nodejs Restify Mongoose Demo'
      }
      , openUserSignup: false // set to true to create users and assign a role, if false, API only allows admins to create an Admin role user
      , usernameOrPassword: true // true: Login, password reset and resend email verification can use either password or username, false: only username
      , host: 'localhost'
	    , port: '3000'
	    , db_prefix: 'mongodb'
  	  , db_port: '27017'
	    , db_database: 'test_database'
      , session_timeout: 1200000 // defaults to 20 minutes, in ms (20 * 60 * 1000)
      , socket_loglevel: '1' // 0 - error, 1 - warn, 2 - info, 3 - debug
      , mailSettings : {
          mailFrom: 'test@gmail.com'
          , mailService: "Gmail"
          , mailAuth: {user: "test@gmail.com", pass: "testpass"}
          , sendEmail: false
          , browserPreview: true
      // see routes-user.js searchUsers
      // the search results only inlcude ObjectId, name, username and email
      // to further restrict returned fields, each (or all) of these can be set to false
      }
      , searchSettings : { // if any of these are false, that field will not be populated
          allowEmail: true
          , allowName: true
          , allowUsername: true
      }
      , version: '0.9.4'
    }
    , test: {
        root: require('path').normalize(__dirname + '/..')
        , app: {
            name: 'Nodejs Restify Mongoose Demo'
        }
        , openUserSignup: false
    }
    , production: {
        root: require('path').normalize(__dirname + '/..')
        , app: {
            name: 'Nodejs Restify Mongoose Demo'
        }
        , openUserSignup: false
    }
}




