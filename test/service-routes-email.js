// TODO
/* Test times out
describe('Email', function() {
  describe('/email', function() {
    var agent = superAgent.agent();
    it('should start with signin', loginUser(agent, 'user', 'user'));
    it('send an email', function(done) {
      this.timeout(5000);
      agent.post(baseUrl + '/api/v1/email').send({ to: 'johnny@be.good', subject:'some subject', message: 'this is a test' }).end(function(err, res) {
        console.log(convertObject(err));
        console.log(convertObject(res));
        res.should.have.status(200);
        res.text.should.include('{}');
        return done();
      });
    });
  });
});

*/
