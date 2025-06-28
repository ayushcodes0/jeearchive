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

exports.getAllTests = async (req, res) =>{
    try {

        const tests = await Test.find().sort({createdAt: -1}); // latest tests first
        res.status(200).json({
            message: 'Tests fetched successfully',
            tests
        });
        
    } catch (err) {
        console.error('Error fetching tests:', err.message);
        res.status(500).json({
            message: 'Error fetching tests',
            error: err.message
        });
    }
}