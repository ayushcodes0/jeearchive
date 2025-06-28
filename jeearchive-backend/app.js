const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // Example route import
const testRoutes = require('./routes/test');

// express app
const app = express();

// middlewares
app.use(express.json());
app.use(cors());  
app.use(helmet());
app.use(morgan('dev')); 

// checking route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'My Jee Archive is running',
    status: 'OK'
  });
});

// TODO: Add your route imports and mounting here
// Example:
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // Example route usage
app.use('/api/tests', testRoutes); // Test routes

module.exports = app;
