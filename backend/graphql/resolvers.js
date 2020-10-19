const User = require('../models/user');
const bcrybt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

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

    }
};