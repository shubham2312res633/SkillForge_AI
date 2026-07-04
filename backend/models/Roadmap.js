const mongoose = require('mongoose');

const MonthlyPlanSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  topics: {
    type: [String],
    default: []
  },
  timeRequired: {
    type: String,
    default: ''
  },
  projects: [{
    title: String,
    description: String,
    skills: [String],
    difficulty: String,
    reason: String
  }],
  resources: [{
    name: String,
    url: String,
    type: { type: String, default: 'Article' }
  }],
  milestones: {
    type: [String],
    default: []
  }
});

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  months: [MonthlyPlanSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
