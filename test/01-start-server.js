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

// Helper methods
convertObject = function(objectArg) {
  var output = '';
  for (property in objectArg) {
    if (typeof objectArg[property] == 'function') {
      output += property + ' function: ' + functionName(objectArg[property]) + '; ';
    } else {
      output += property + ': ' + objectArg[property] + '; ';
    }
  }
  return output;
}

functionName = function(fun) {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}

before(function(done) {
    done();
});


