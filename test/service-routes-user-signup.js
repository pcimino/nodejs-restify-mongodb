// init the test client
var client = restify.createJsonClient({
    version: '*',
    url: 'http://127.0.0.1:3000'
});

describe('User Signup Services ', function() {
  // Test #1
  describe('username exists : Existing user', function() {
    it('Expect error Username already in use.', function(done) {
      client.get('/api/v1/user/username/exists?username=admin', function(err, req, res, data) {
        if (err) {
          assert.equal(data.message, "Username already in use.");
          done();
        } else {
          throw new Error('invalid response from /api/v1/user/username/exists ' + JSON.stringify(data));
        }
      });
    });
  });
  // Test #2
  describe('username exists : New username', function() {
    it('success should get an empty response ', function(done) {
      client.get('/api/v1/user/username/exists?username=admin2', function(err, req, res, data) {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        else {
          if (JSON.stringify(data) != '{}') {
            throw new Error('invalid response from /api/v1/user/username/exists ' + res.body);
          }
          done();
        }
      });
    });
  });
  // Test #3
  describe('email exists : Existing email', function() {
    it('Expect error', function(done) {
      client.get('/api/v1/user/email/exists?email=user@user.com', function(err, req, res, data) {
        if (err) {
          assert.equal(data.message, "Email already in use.");
          done();
        } else {
            throw new Error('invalid response from /api/v1/user/email/exists ' + JSON.stringify(data));
        }
      });
    });
  });
  // Test #4
  describe('email exists : New email', function() {
    it('success should get an empty response', function(done) {
      client.get('/api/v1/user/email/exists?email=user@user2.com', function(err, req, res, data) {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        else {
          if (JSON.stringify(data) != '{}') {
            throw new Error('invalid response from /api/v1/user/email/exists ' + JSON.stringify(data));
          }
          done();
        }
      });
    });
  });
  // Test #5
  describe('Create a new user', function() {
    it('success', function(done) {
      client.post('/api/v1/user', {'username':'user2','name':'user2','email':'user2@user2.com','password':'user2','vPassword':'user2'}, function(err, req, res, data) {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        else {
          if (data.username != 'user2' || data.hashed_password == '') {
            throw new Error('invalid response from /api/v1/user ' + JSON.stringify(data));
          }
          done();
        }
      });
    });
  });
  // Test #6
  describe('Create a new user', function() {
    it('Non-matching passwords', function(done) {
      client.post('/api/v1/user', {'username':'user3','name':'user3','email':'user3@user3.com','password':'user3','vPassword':'user2'}, function(err, req, res, data) {
        if (err) {
          assert.equal(data.message, "Password and Verify Password must match.");
          done();
        }
        else {
          throw new Error('invalid response from /api/v1/user ' + JSON.stringify(data));
        }
      });
    });
  });
  // Test #7
  describe('Create a new user', function() {
    it('Invalid email', function(done) {
      client.post('/api/v1/user', {'username':'user3','name':'user3','email':'user3','password':'user3','vPassword':'user3'}, function(err, req, res, data) {
        if (err) {
          assert.equal(data.message, "Please enter a valid email address.");
          done();
        }
        else {
          throw new Error('invalid response from /api/v1/user ' + JSON.stringify(data));
        }
      });
    });
  });
  // Test #8
  describe('resend verify code using username', function() {
    it('success should get an empty response', function(done) {
      client.get('/api/v1/verify/resend?username=user2', function(err, req, res, data) {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        else {
          if (JSON.stringify(data) == '{}') {
            throw new Error('invalid response from /api/v1/verify/resend ');
          }
          done();
        }
      });
    });
  });
  // Test #9
  describe('resend verify code using email', function() {
    it('success should get an empty response', function(done) {
      client.get('/api/v1/verify/resend?email=user2@user2.com', function(err, req, res, data) {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        else {
          if (JSON.stringify(data) == '{}') {
            throw new Error('invalid response from /api/v1/verify/resend ');
          }
          done();
        }
      });
    });
  });
  // Test #10
  describe('resend temporary password using username', function() {
    it('success should get an empty response', function(done) {
      client.get('/api/v1/password/sendNew?username=user2', function(err, req, res, data) {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        else {
          if (JSON.stringify(data) == '{}') {
            throw new Error('invalid response from /api/v1/password/sendNew ');
          }
          done();
        }
      });
    });
  });
  // Test #11
  describe('resend temporary password using username', function() {
    it('success should get an empty response', function(done) {
      client.get('/api/v1/password/sendNew?email=user2@user2.com', function(err, req, res, data) {
        if (err) {
          throw new Error(JSON.stringify(err));
        }
        else {
          if (JSON.stringify(data) == '{}') {
            throw new Error('invalid response from /api/v1/password/sendNew ');
          }
          done();
        }
      });
    });
  });
});

