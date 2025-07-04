/* 

  This is my auth controller.
  This page contains the controllers related to auth.
  Such as : register, login, getMe.
  Also a generateToken function.  

*/

// importing User model
const User = require('../models/User');
// importing jsonwebtoken
const jwt = require('jsonwebtoken');

// this function used to generate the jsonwebtoken which has the expiration of 7 days
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}


// this is register function used to register user and provide them a token to get remembered.
exports.register = async (req, res) => {
    try {
        
        const {firstName, lastName, email, password, confirmPassword, gender, role} = req.body;

        // check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            gender,
            role
        });

        // generate token
        const token = generateToken(newUser);

        // return response
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: `${newUser.firstName} ${newUser.lastName}`,
                email: newUser.email,
                role: newUser.role,
            }
        });

    } catch (err) {
        
        console.error('Error registering user:', err.message);
        res.status(500).json({
            message: 'Server error. Please try again.',
            error: err.message
        });
    }
}


// this is login function used to login user using the token they got earlier
exports.login = async (req, res) => {
    try {

        const {email, password} = req.body;

        // check for user
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        // check password
        const isMatch = await user.matchPassword(password);
        if(!isMatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        // generate token
        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )

        // return response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
            }
        });
        
    } catch (err) {
        console.error('Login error: ', err.message);
        res.status(500).json({
            message: 'Server error. Please try again.',
            error: err.message
        });
    }
}


// this is getMe function used to find the information of the user itself
exports.getMe = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        if(!user) return res.status(404).json({
            message: 'user not found'
        });
        res.status(200).json({
            message: '/me user data fetched successfully',
            user
        })
    }
    catch(err){
        console.log("Error fetching /me user data" , err.message);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

