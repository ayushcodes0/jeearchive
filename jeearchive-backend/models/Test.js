/* 

  This is my test model page.
  This page contains the test schema.

*/

// importing mongoose
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
  date: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: 'Follow JEE Mains exam pattern. Attempt only 5 out of 10 questions in Section B.'
  },
  type: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });


// combined text search index
testSchema.index(
  { title: 'text', instructions: 'text' },
  { weights: { title: 10, instructions: 3 }, name: 'test_search_index' }
);

// date indexes
testSchema.index({ date: 1 }, { name: 'date_asc_index' });
testSchema.index({ date: -1 }, { name: 'date_desc_index' });

// creator index
testSchema.index({ createdBy: 1, date: -1 }, { name: 'creator_date_index' });

// shift indexes
testSchema.index(
  { date: -1, shift: 1 }, 
  { name: 'date_shift_desc_index' }
);

// partial index for future tests
testSchema.index(
  { date: 1 },
  { 
    partialFilterExpression: { date: { $gte: new Date() } },
    name: 'future_tests_index'
  }
);


module.exports = mongoose.model('Test', testSchema);
