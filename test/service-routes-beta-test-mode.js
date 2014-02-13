describe('Beta Invite', function() {
  describe('/beta', function() {
    var agent = superAgent.agent();
    it('should start with signin', loginUser(agent, 'admin', 'admin'));
    it('Check the Beta status false', function(done) {
      agent.get(baseUrl + '/api/v1/beta').end(function(err, res) {
        res.body.status.should.equal(false);
        return done();
      });
    });
    it('Change the Beta status to true', function(done) {
      agent.put(baseUrl + '/api/v1/beta').send({ status: true }).end(function(err, res) {
        // console.log(convertObject(res.body))
        res.body.message.should.equal("Beta mode is ON");
        res.body.status.should.equal(true);
        return done();
      });
    });

    // Send beta invite
    it('Send a Beta invite', function(done) {
      agent.post(baseUrl + '/api/v1/beta').send({ email: 'johnny@be.good' }).end(function(err, res) {
        // console.log(convertObject(res.body.message))
        res.body.message.should.equal("Beta invite sent to johnny@be.good");
        return done();
      });
    });

    // Turn beta off before running other tests
    it('Change the Beta status to false', function(done) {
      agent.put(baseUrl + '/api/v1/beta').send({ status: false }).end(function(err, res) {
        // console.log(convertObject(res.body))
        res.body.message.should.equal("Beta mode is OFF");
        res.body.status.should.equal(false);
        return done();
      });
    });
  });
});

