const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', function () {
    it('should throw an error if accessing the database fails', function (params) {
        sinon.stub(User, 'findOne'); 
        User.findOne.throws();

        User.findOne.restore();
    });
});