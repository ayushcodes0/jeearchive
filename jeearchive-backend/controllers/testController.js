const Test = require('../models/Test');

exports.createTest = async (req, res) => {
    try {

        const {title, duration, totalMarks, instructions} = req.body;

        const test = await Test.create({
            title,
            duration,
            totalMarks,
            instructions,
            createdBy: req.user.id  // from auth middleware
        });

        res.status(201).json({
            message: 'Test created successfully',
            test
        });
        
    } catch (err) {
        console.error('Error creating test:', err.message);
        res.status(500).json({
            message: 'Error creating test',
            error: err.message
        })
        
    }
}