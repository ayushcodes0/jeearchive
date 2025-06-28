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
    type: String, // store a link to Cloudinary/AWS S3 etc.
    default: null
  },
  options: [
    {
      label: { type: String, required: true },       // A, B, C, D
      text: { type: String, default: null },
      optionImage: { type: String, default: null },  // image inside option
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
