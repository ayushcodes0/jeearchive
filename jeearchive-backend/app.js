const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

module.exports = app;
