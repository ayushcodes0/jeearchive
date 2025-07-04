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
    required: function () {
      return this.provider === 'local';
    },
    trim: true
  },
  lastName: {
    type: String,
    required: function () {
      return this.provider === 'local';
    },
    trim: true
  },
  fullName: {
    type: String
  },
  gender: {
    type: String,
    required: function () {
      return this.provider === 'local';
    },
    enum: ['male', 'female', 'other'],
  },
  email: {
    type: String,
    required: function () {
      return this.provider === 'local';
    },
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      return this.provider === 'local';
    },
    minlength: 6
  },
  provider: { type: String, default: 'local' }, // 'google' | 'local'
  googleId: String,
  avatar: {
    type: String,
    default: null
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