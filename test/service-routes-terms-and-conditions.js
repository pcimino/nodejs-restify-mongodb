describe('Users', function() {
  describe('/user', function() {
    var agent = superAgent.agent();
    it('should start with signin', loginUser(agent, 'admin', 'admin'));
    it('Get User', function(done) {
      agent.get(baseUrl + '/api/v1/user').end(function(err, res) {
        res.should.have.status(200);
        res.text.should.include('admin@admin.com');
        return done();
      });
    });
    it('Get a user by username', function(done) {
      agent.get(baseUrl + '/api/v1/user/user').end(function(err, res) {
        var messageThread = (JSON.parse(res.text));
        res.text.should.include('user@user.com');
        return done();
      });
    });
  });
});


/* TODO Tests
   * Update user information
   app.put('/api/v1/user', auth.requiresLogin, putUser, putUserValidations, putUserPostValidate, saveUser);


   * Administrator updating user information
   app.put('/api/v1/admin/user', auth.adminAccess, putUserByAdmin, putUserValidations, putUserPostValidate, saveUser);


   * delete a user
   app.del('/api/v1/admin/user', auth.adminAccess, deleteUser);
*/
