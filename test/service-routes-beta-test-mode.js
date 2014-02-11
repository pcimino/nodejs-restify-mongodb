
describe('service: default', function() {
    // Test #1
    describe('default 200 response check', function() {
        it('default should get a 200 response', function(done) {
            client.get('/', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    if (res.body == '') {
                      throw new Error('invalid response from / ' + res.body);
                    }
                    done();
                }
            });
        });
    });
    // Add more tests as needed...
});



