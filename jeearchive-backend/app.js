
/* 

  This is my app.js page
  This file is the main entry point to my backend application.
  It is responsible for initializing the express server and setting up essential middlewares.

*/

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');  // auth routes 
const userRoutes = require('./routes/users');  // user routes
const testRoutes = require('./routes/test'); // test routes
const questionRoutes = require('./routes/question'); // question routes
const resultRoutes = require('./routes/result'); // result routes
const rateLimiter = require('./middlewares/rateLimiter'); // rate limiter

// express app
const app = express();

// middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // Allow cookies or credentials
}));
app.use(helmet());
app.use(morgan('dev')); 

app.use(rateLimiter);

// Example route to check app working
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'My Jee Archive is running',
    status: 'OK'
  });
});

// Using all the routes here
app.use('/api/auth', authRoutes); // using auth routes
app.use('/api/user', userRoutes); // using user routes
app.use('/api/test', testRoutes); // using test routes
app.use('/api/question', questionRoutes); // using question routes
app.use('/api/result', resultRoutes); // using result routes

module.exports = app;
