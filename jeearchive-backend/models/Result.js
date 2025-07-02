/* 

  This is my result model page.
  This page contains the result schema.

*/

// importing mongoose
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: {
      type: String,
      default: null
    },         
    numericalAnswer: {
      type: String,
      default: null
    },        
    isCorrect: {
      type: Boolean
    },             
    correctOption: {
      type: String,
      default: null
    },          
    correctNumericalAnswer: {
      type: String,
      default: null
    },
    markedForReview: {
      type: Boolean,
      default: false,
    },
    answeredAndMarkedForReview: {
      type: Boolean,
      default: false,
    },
    visited: {
      type: Boolean,
      default: false,
    }, 
  }
],
attemptSummary: {
  Physics: { correct: Number, wrong: Number, unattempted: Number },
  Chemistry: { correct: Number, wrong: Number, unattempted: Number },
  Maths: { correct: Number, wrong: Number, unattempted: Number }
},
  score: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  correctCount: Number,
  wrongCount: Number,
  unattemptedCount: Number
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);