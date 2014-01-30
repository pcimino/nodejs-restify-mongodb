
// http://visionmedia.github.io/mocha/
// http://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
// https://github.com/visionmedia/superagent#persisting-an-agent-with-cookies-ie-sessions
// http://51elliot.blogspot.com/2013/08/testing-expressjs-rest-api-with-mocha.html
// https://gist.github.com/szarsti/3348033
// https://github.com/visionmedia/superagent#persisting-an-agent-with-cookies-ie-sessions

function loginUser(agent, username, password) {
  return function(done) {
    // console.log(JSON.stringify(client.url.host))
    // console.log("loginUser :" + client.url.host + '/api/v1/session/login ' + username +", " + password)
    agent
      .post(client.url.host + '/api/v1/session/login')
      .send({ username: username, password: password })
      .end(onResponse);
    function onResponse(err, res) {
      console.log(convertObject(res.headers['set-cookie']))
  //    should.exist(res.headers['set-cookie']);
      return done();
    }
  };
}

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
    userAgent.post(client.url + '/api/v1/session/login', {'username':'user','password':'user'}, function(err, req, res, data) {
      sessionCookie = res.headers['set-coookie'][0];
      if (err) {
        throw new Error(err.status +":" + err.method);
      }
      else {
    //    console.log('Test 2 ' + convertObject(res.headers['set-cookie']))
    //    should.exist(res.headers['set-cookie']);
        done();
      }
    });
  });

  // Authenticated calls
  // Test #3
  describe('get session timeout', function() {
    userAgent = superAgent;//.agent();
    it('should start with signin', loginUser(userAgent, 'user', 'user'));
    it('success should get an empty response', function(done) {
      userAgent.get(client.url + '/api/v1/timeout', function(err, req, res, data) {
        if (err) {
          throw new Error(err.status +":" + err.method);
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
  // Test #4
  describe('logout', function() {
    before(loginUser(userAgent, 'user', 'user'));
    it('success', function(done) {
      // logout
      userAgent.get(client.url + '/api/v1/session/logout', function(err, req, res, data) {
        if (err) {
          throw new Error(err.status +":" + err.method);
        }
        else {
    //      should.not.exist(res.headers['set-cookie']);
          done();
        }
      });
    });
  });



});


