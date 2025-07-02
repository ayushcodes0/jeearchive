/* 

  This is my user model page.
  This page contains the user schema.

*/

// importing mongoose
const mongoose = require('mongoose');
// importing bcrypt to hide the password
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  profileImage: {   // storing profileImage on cloudinary and the link to that image here
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// hash password before saving
userSchema.pre('save', async function(next){

    // hash only if password is modified or new
    if(!this.isModified('password')) return next();

    // hash password
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmPassword = undefined; // remove confirmPassword field
    next();

});

// compare password
userSchema.methods.matchPassword = function (enteredPassword){
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;