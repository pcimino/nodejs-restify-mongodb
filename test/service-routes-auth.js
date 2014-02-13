// https://github.com/hunterloftis/component-test/blob/master/lib/users/test/controller.test.js
describe('User controller', function() {
  describe('/login', function() {
    describe('with good credentials', function() {
      var agent = superAgent.agent();
      it('should create a user session', loginUser(agent, 'user', 'user'));
    });

    describe('with bad credentials', function() {
      var agent = superAgent.agent();
      it('should be rejected', function(done) {
        agent
          .post(client.url.host + '/api/v1/session/login')
          .send({ username: 'user', password: 'wrong' })
          .end(onResponse);
        function onResponse(err, res) {
          res.should.have.status(403);
          res.text.should.include('Invalid password.');
          return done();
        }
      });
    });
  });
  describe('/logout', function() {
    var agent = superAgent.agent();
    it('should start with signin', loginUser(agent, 'user', 'user'));
    it('should sign the user out', function(done) {
      agent.get(client.url.host + '/api/v1/session/logout').end(function(err, res) {
        // console.log(convertObject(res));
        res.should.have.status(200);
        res.text.should.include('{}');
        return done();
      });
    });
  });
  // Authenticated calls
  // Test #3
  describe('get session timeout', function() {
    var agent = superAgent.agent();
    it('should start with signin', loginUser(agent, 'user', 'user'));
    it('success should get an empty response', function(done) {
      agent.get(client.url.host + '/api/v1/timeout').end(function(err, res) {
        res.body.message.should.include('Success');
        return done();
      });
    });
  });
});



