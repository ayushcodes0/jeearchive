/* 

  This is my auth.js inside middleware.
  This page contains the functions(middlewares) related to auth.

*/

// importing jsonwebtoken
const jwt = require('jsonwebtoken');


// this is protect middleware use to check the user is logged in or not
const protect = (req, res, next) => {
    let token;

    // check if token exists in authorization header

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {

            token = req.headers.authorization.split(' ')[1];

            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // attach user data to request
            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            next();
            
        } catch (err) {
            return res.status(401).json({
                message: 'Invalid or expired token',
                error: err.message
            })
        }
    }
    else{
        return res.status(401).json({
            message: 'No token provided, authorization denied'
        })
    }
};

module.exports = protect;