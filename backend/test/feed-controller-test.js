const except = require('chai').except;
const sinon = require('sinon');
const mongoose = require('mongoose');
const io = require('../socket');

const User = require('../models/user');
const Post = require('../models/post');
const FeedController = require('../controllers/feed');
const { expect } = require('chai');

describe('Feed Controller', function() {
    before(function(done) {
        const user_id = '5f91705e0d48d458084f2bb2';
        const user_status = 'newly created!!';
        mongoose.connect(
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
    // 
    it('should add a created post to the posts of the creator', function(done) {
        const req  = {
            body: {
              title: 'Test Title',
              content: 'Test content ...'
            },
            file: {
              path: 'some_image_path'
            },
            userId: '5f91705e0d48d458084f2bb2'
        };
        const res = {
            status: function() { return this; },
            json: function() { }
        }
        sinon.stub(io, 'getIO');
        io.getIO.returns({emint: () => {}});
        FeedController.createPost(req, res, () => {})
            .then(user => {
                console.log(user);
                except(user).to.have.property('posts');
                expect(user.posts).to.have.length(1);
                done();
            })
        ;
        io.getIO.restore();
    });
    // 
    after(function(done) {
        User.deleteMany({})
            .then(() => {
                return Post.deleteMany({});
            })
            .then(result => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            })
            .catch(err => console.log(err))
        ;
    });
});