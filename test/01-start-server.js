restify = require('restify');
assert = require('assert');

// used for auth session
superAgent = require('superagent');
userAgent = superAgent.agent();
should = require('should');


// init the test client
client = restify.createJsonClient({
    version: '*',
    url: 'http://127.0.0.1:3000'
});

/*
 * Utility for logging the user into the REST server
 * Super Agent handles the client session cookie for subsequent calls
 */
loginUser = function(agent, username, password) {
  return function(done) {
    agent
      .post(client.url.host + '/api/v1/session/login')
      .send({ email: username, password: password })
      .end(onResponse);

    function onResponse(err, res) {
      res.should.have.status(200);
      res.text.should.include('"username":"' + username + '"');
      return done();
    }
  };
}

/*
 * Kinda like JSON.stringify() but doesn't blow up on circular objects, doesn't
 * fully expand contained objects either
 */
convertObject = function(objectArg) {
  var output = '';
  for (property in objectArg) {
    var objName = objectArg[property].constructor.toString();
    if (objName) {
      objName = objName.substring(objName.indexOf(' '), objName.indexOf('(')).trim();
    }
    if (typeof objectArg[property] == 'function') {
      output += property + ' function: ' + functionName(objectArg[property]) + '; ';
    } else {
      var content = objectArg[property];
      try {
        content = JSON.stringify(objectArg[property]);
      } catch(err) {
        // console.log(err);
      }
      output += property + ' ' + objName + ': ' + content + '; ';
    }
  }
  return output;
}

/*
 * Used by convertObject
 */
functionName = function(fun) {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}

before(function(done) {
    done();
});





