/* 

  This is my admin.js inside middlewares.
  This page contains the adminOnly middleware.

*/


// adminOnly function to check that the logged in user is admin or not
const adminOnly = (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        return next();
    }

    return res.status(403).json({
        message: 'Access denied. Admins only.'
    })
}

module.exports = adminOnly;