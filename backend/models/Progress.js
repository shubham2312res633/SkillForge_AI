const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  completedTopics: {
    type: [String],
    default: []
  },
  completedProjects: {
    type: [String],
    default: []
  },
  overallCareerScore: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', ProgressSchema);
