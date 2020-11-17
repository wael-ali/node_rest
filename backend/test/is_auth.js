const expect = require('chai').expect;

const authMiddleware = require('../middleware/is-auth');

describe('Auth Middleware', function () {
    it('should throw error if there is no authorization header is present', function () {
        const req = {
            get: function (){
                return null;
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated.');

    });

    it('should throw error if auth header one string', function () {
        const req = {
            get: function (){
                return 'oneString';
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });
});
