// TODO
describe('User controller', function() {
  describe('/logout', function() {
    var agent = superAgent.agent();
    it('should start with signin', loginUser(agent, 'user', 'user'));
    it('should sign the user out', function(done) {
      agent.get(baseUrl + '/api/v1/session/logout').end(function(err, res) {
        // console.log(convertObject(res));
        res.should.have.status(200);
        res.text.should.include('{}');
        return done();
      });
    });
  });
});

