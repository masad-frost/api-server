const { it } = require('mocha');
const { expect } = require('chai');
const request = require('./base');
const { corsOptions } = require('../utils/cors');

const expectCORSHeaders = (response) => {
    expect(response).to.have.header('Access-Control-Allow-Origin', corsOptions.origin);
    expect(response).to.have.header('Access-Control-Allow-Credentials', corsOptions.credentials.toString());

    // testing allowed methods and headers only makes sense in case of options
    if (response.request.method.toLowerCase() === 'options') {
        expect(response).to.have.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
        expect(response).to.have.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
    }
};

const testCors = (path, getResponse) => {
    it('returns the correct CORS headers', done => {
        const response = getResponse();
        expectCORSHeaders(response);
        done();
    });

    it('returns the correct CORS headers for OPTIONS request', (done) => {
        request()
            .options(path)
            .redirects(0)
            .end((err, res) => {
                const expectedStatus = corsOptions.optionsSuccessStatus;
                expect(res.status).to.equal(expectedStatus, `Expected OPTIONS to return ${expectedStatus} status, got ${res.status}`);
                expectCORSHeaders(res);
                done();
            });
    });
};

module.exports = testCors;
