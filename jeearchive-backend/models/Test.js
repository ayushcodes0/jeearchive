
const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subjectWiseSectionCount: {
    type: Object,
    default: {
      Physics: { sectionA: 20, sectionB: 10 },
      Chemistry: { sectionA: 20, sectionB: 10 },
      Maths: { sectionA: 20, sectionB: 10 }
    }
  },
  duration: {
    type: Number,
    required: true,
    default: 180 // minutes
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 300
  },
  negativeMarking: {
    type: Boolean,
    default: true
  },
  instructions: {
    type: String,
    default: 'Follow JEE Mains exam pattern. Attempt only 5 out of 10 questions in Section B.'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
