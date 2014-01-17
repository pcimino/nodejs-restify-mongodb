// init the test client
var client = restify.createJsonClient({
    version: '*',
    url: 'http://127.0.0.1:8080'
});

describe('service: hello', function() {
    // Test #1
    describe('200 response check', function() {
        it('should get a 200 response', function(done) {
            client.get('/hello/world', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    if (data.code != 200) {
                        throw new Error('invalid response from /hello/world');
                    }
                    done();
                }
            });
        });
    });
    // Add more tests as needed...
});
