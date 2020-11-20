const expect = require('chai').expect;
const sinon = require('sinon');
const mongose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', function () {
    // Runs once before the tests begin
    before(function (done) {
        const user_id = '5f91705e0d48d458084f2bb2';
        const user_status = 'newly created!!';
        mongose.connect(
                'mongodb+srv://node_toturial_1:WNct0GPpfk1rQfrv@cluster0.q4mpc.mongodb.net/node_test_2?retryWrites=true&w=majority'
            )
            .then(result => {
                const user = new User({
                    email: 'test@test.com',
                    password: 'foobar',
                    name: 'John Doe',
                    status: user_status,
                    posts: [],
                    _id: user_id
                });
                return user.save();
            })
            .then(() => {
                done();
            })
            .catch(err => console.log(err))
        ;
    });
    // Runs once after the tests finish.
    after(function(done) {
        User.deleteMany({}) // Delete all users
            .then(() => {
                return mongose.disconnect();
            })
            .then(() => {
                done();
            })
        ;
    });
    // Runs before every test
    beforeEach(function(){
        console.log('Before test ...');
    });
    // Runs After every test
    beforeEach(function(){
        console.log('After test ...');
    });
    // Hier goes the tests
    it('should throw an error if accessing the database fails', function (done) {
        sinon.stub(User, 'findOne'); 
        User.findOne.throws();
        const req = {
            body: {
                email: 'test@email.com',
                password: 'tester'
            }
        };

        AuthController.login(req, {}, () => {}).then(result => {
            // console.log(result);
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done()
        });
        User.findOne.restore();
    });

    it('should send aresponse with a valid user status for an existing user', function (done) {
        const user_id = '5f91705e0d48d458084f2bb2';
        const user_status = 'newly created!!';
        
        const req = { userId: user_id };
        const res = { 
            statusCode: 200,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status
            }
        };
        AuthController.getUserStatus(req, res, () => {})
            .then(() => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.userStatus).to.be.equal(user_status);
                done()
            })
        ;
    });
});