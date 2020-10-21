const bcrybt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
    // resolverName(args, req){}
    createUser: async function({ userInput }, req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)){
            errors.push({field: 'email', message: 'Email not valid'});
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min: 5})){
            errors.push({field: 'password',message: 'Password too short!'});
        }
        if (errors.length > 0){
            const error = new Error('Invalid input.');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser){
            const error = new Error('User exist already!');
            throw error;
        }
        const hashedPW = await bcrybt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPW,
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() }
    },
    login: async ({email, password}, req) => {
         const user = await User.findOne({email, email});
         if (!user){
             const error = new Error('User not foundt.')
             error.code = 401;
             throw  error;
         }
         const isEqual = await bcrybt.compare(password, user.password);
         if (!isEqual){
             const error = new Error('Password is incorrect!');
             error.code = 401;
             throw error;
         }
        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
            },
            process.env.APP_SECRET,
            { expiresIn: '1h' }
        );

         return { token: token, userId: user._id.toString() }
    },
    createPost: async  ({ postInput }, req) => {
        if (!req.isAuth){
            const error = new Error('Not Authenticated!');
            error.code = 403;
            error.data = {message: 'Not loged in.'};
            throw error;
        }
       const errors = [];
       if (!validator.isLength(postInput.title, { min: 5})){
           errors.push({ field: 'title', message: 'Title too short!' });
       }
       if (!validator.isLength(postInput.content, { min: 5})){
           errors.push({ field: 'content', message: 'content too short!' });
       }
       // if (!validator.isUrl(postInput.imageUrl, { min: 5})){
       //     errors.push({ field: 'imageUrl', message: 'Image Url not valid' });
       // }
       if (errors.length > 0){
           const error = new Error('Not Valid input!');
           error.code = 422;
           error.data = errors;
           throw error;
       }
       const user = await User.findById(req.userId);
       if (!user){
           const error = new Error('Invalid user!');
           error.code = 401;
           throw error
       }
       const post = new Post({
           title: postInput.title,
           content: postInput.content,
           imageUrl: postInput.imageUrl,
           creator: user
       });
       const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();
        const p =  {
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString(),
        }
        return p;
    },
    posts: async ({page},req) => {
        if (!req.isAuth){
            const error = new Error('Not Authenticated!');
            error.code = 401;
            throw error;
        }
         page = page || 1;
        const perPage = 2;
        const totalPosts = await Post.find().countDocuments();
        const posts = await Post.find()
            .sort({createdAt: -1})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('creator')
        ;
        return {
            posts: posts.map(p => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString(),
                }
            }),
            totalPosts: totalPosts
        };
    }
};