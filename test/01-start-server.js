restify = require('restify');
assert = require('assert');

before(function(done) {
    require('../app').StartServer();
    done();
});

