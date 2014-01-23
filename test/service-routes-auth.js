// init the test client
var client = restify.createJsonClient({
    version: '*',
    url: 'http://127.0.0.1:3000'
});


// http://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
// https://github.com/visionmedia/superagent#persisting-an-agent-with-cookies-ie-sessions
// http://51elliot.blogspot.com/2013/08/testing-expressjs-rest-api-with-mocha.html
// https://gist.github.com/szarsti/3348033
// https://github.com/visionmedia/superagent#persisting-an-agent-with-cookies-ie-sessions


describe('User authentication', function() {
  // publicly accessible calls (non-authenticated)
  // Test #1
  it('user not authorized', function(done) {
    client.post('/api/v1/session/login', {'username':'user2','password':'user3'}, function(err, req, res, data) {
      if (err) {
        if (data.message != 'Invalid username.') {
          throw new Error(JSON.stringify(err));
        }
        done();
      }
      else {
        throw new Error('invalid response from /api/v1/user ' + JSON.stringify(data));
      }
    });
  });

  // Authenticate
  // Test #2
  it('success', function(done) {
    client.post('/api/v1/session/login', {'username':'user','password':'user'}, function(err, req, res, data) {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      else {
        if (data.username != 'user' || data.hashed_password == '') {
          throw new Error('invalid response from /api/v1/session/login ' + JSON.stringify(data));
        }
        done();
      }
    });
  });

  // Authenticated calls
  // Test #3
  describe('get session timeout', function() {
    it('success should get an empty response', function(done) {
      client.get('/api/v1/timeout', function(err, req, res, data) {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        else {
          if (JSON.stringify(data) == '{}') {
            throw new Error('invalid response from /api/v1/timeout ' + JSON.stringify(data));
          }
          done();
        }
      });
    });
  });


  // Test #(last) Logout
  it('success', function(done) {
    // logout
    client.get('/api/v1/session/logout', function(err, req, res, data) {
      if (err) {
        throw new Error(JSON.stringify(err));
      }
      else {
        if (JSON.stringify(data) != '{}') {
          throw new Error('invalid response from /api/v1/session/logout ' + JSON.stringify(data));
        }
        done();
      }
    });
  });
});

