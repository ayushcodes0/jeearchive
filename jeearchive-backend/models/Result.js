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
    selectedOption: String,         
    numericalAnswer: String,        
    isCorrect: Boolean,             
    correctOption: String,          
    correctNumericalAnswer: String  
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
