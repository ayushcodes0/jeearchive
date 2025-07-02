/* 

  This is server.js page.
  It is the page where I am connecting my app to mongodb database by colling the connectDB() function.

*/

const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');  // getting the app from the app.js page.
const connectDB = require('./config/db'); // getting the connectDB() function from db.js inside config foler.

const PORT = process.env.PORT || 5000;


// connecting to mongodb.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
