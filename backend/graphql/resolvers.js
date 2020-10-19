const User = require('../models/user');
const bcrybt = require('bcryptjs');
const validator = require('validator');

module.exports = {
    createUser: async function({ userInput }, req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)){
            errors.push({message: 'Email not valid'});
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min: 5})){
            errors.push({message: 'Password too short!'});
        }
        if (!validator.isEmail(userInput.email)){
            errors.push('Email not valid');
        }
        if (errors.length > 0){
            const error = new Error('Invalid input.');
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
    }
};