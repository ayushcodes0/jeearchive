/* 

  This is my question model page.
  This page contains the question schema.

*/

// importing mongoose
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  subject: {
    type: String,
    enum: ['Physics', 'Chemistry', 'Maths'],
    required: true
  },
  section: {
    type: String,
    enum: ['A', 'B'],
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'numerical'],
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String, // will store the image on cloudinary and the link to that here.
    default: null
  },
  options: [
    {
      label: { type: String, required: true },       // A, B, C, D
      text: { type: String, default: null },
      optionImage: { type: String, default: null },  // similar to imageUrl 
      isCorrect: { type: Boolean, required: true }
    }
  ],
  correctAnswer: {
    type: String // for numerical questions (Section B)
  },
  marks: {
    type: Number,
    default: 4
  },
  negativeMarks: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
