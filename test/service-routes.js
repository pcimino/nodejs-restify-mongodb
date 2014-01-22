// init the test client
var client = restify.createJsonClient({
    version: '*',
    url: 'http://127.0.0.1:3000'
});

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
    // Test #2
    describe('api 200 response Success', function() {
        it('api should get a Success response', function(done) {
            client.get('/api', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {

                    if (data.message != 'Success') {
                        throw new Error('invalid response from /api ' + JSON.stringify(data));
                    }
                    done();
                }
            });
        });
    });
    // Test #3
    describe('db 200 response check', function() {
        it('db should get a 200 response', function(done) {
            client.get('/db', function(err, req, res, data) {
                if (err) {
                    throw new Error(err);
                }
                else {
                    if (data.documents[0].ok != 1) {
                        throw new Error('invalid response from /db ' + JSON.stringify(data) +":" + JSON.stringify(res));
                    }
                    done();
                }
            });
        });
    });

});

