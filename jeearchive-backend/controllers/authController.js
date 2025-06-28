const User = require('../models/User');
const jwt = require('jsonwebtoken');

// generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}

// @desc   Register user
// @route  POST /api/auth/register
// @access Public


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