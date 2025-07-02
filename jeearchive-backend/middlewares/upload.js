/* 

  This is the upload.js page use to upload file using multer.

*/

// importing multer
const multer = require('multer')

// use in-memory storage for direct Cloudinary upload
const storage = multer.memoryStorage();

// it accepts only images
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
