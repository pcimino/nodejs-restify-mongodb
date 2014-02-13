// TODO only have admin tests right now, need to add remaining tests
var messageId = '';
var messageCount = 0;
describe('Messaging', function() {
  describe('/systemMessage', function() {
    var agent = superAgent.agent();
    it('should start with signin', loginUser(agent, 'admin', 'admin'));
    it('send a message', function(done) {
      agent.post(baseUrl + '/api/v1/systemMessage').send({message: 'test message', subject: 'test message'}).end(function(err, res) {
        // console.log(convertObject(res.body));
        res.should.have.status(200);
        res.text.should.include('{}');
        return done();
      });
    });
    it('Get all messages', function(done) {
      agent.get(baseUrl + '/api/v1/systemMessage').send({archiveFlag:true}).end(function(err, res) {
        var messageThread = (JSON.parse(res.text));
        // console.log(convertObject(messageThread[0]));
        messageId = messageThread[0]._id;
        messageCount = messageThread.length;
        messageThread[0].message.should.equal("test message");
        return done();
      });
    });
    it('Archive the message', function(done) {
      agent.del(baseUrl + '/api/v1/systemMessage').send({systemMessageId: messageId}).end(function(err, res) {
        res.should.have.status(200);
        res.text.should.include('{}');
        return done();
      });
    });
    it('Get all Non-Archived messages', function(done) {
        agent.get(baseUrl + '/api/v1/systemMessage').send({archiveFlag:false}).end(function(err, res) {
          var messageThread = (JSON.parse(res.text));
          // console.log(convertObject(messageThread[0]));
          assert.equal(messageCount,  messageThread.length+1);
          messageCount = messageThread.length; // get the new message count
          return done();
        });
    });
    it('Delete the message', function(done) {
      agent.del(baseUrl + '/api/v1/systemMessage/delete').send({systemMessageId: messageId}).end(function(err, res) {
        res.should.have.status(200);
        res.text.should.include('{}');
        return done();
      });
    });
    it('Get all messages', function(done) {
        agent.get(baseUrl + '/api/v1/systemMessage').send({archiveFlag:false}).end(function(err, res) {
          var messageThread = (JSON.parse(res.text));
          // console.log(convertObject(messageThread[0]));
          assert.equal(messageCount,  messageThread.length);
          return done();
        });
    });
  });
});

 /**
     * @param path {message: '<text>', subject: '<subject>'}
     app.post('/api/v1/messageThread', auth.requiresLogin, postMessageThread);

     * @param path {_id:'', modifyDate: '', fromArchiveFlag: '', toArchiveFlag: '', inappropriateFlag: messages: '' }
     app.put('/api/v1/messageThread', auth.requiresLogin, putMessageThread);

     * @param path { archiveFlag : "true|false"}
     app.get('/api/v1/messageThread', auth.requiresLogin, getMessageThread);

     * @param path {messageThreadId: '<id>'}
     app.del('/api/v1/messageThread', auth.requiresLogin, archiveMessageThread);

 */
