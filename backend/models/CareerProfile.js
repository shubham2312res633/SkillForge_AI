const mongoose = require('mongoose');

const CareerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  targetRole: {
    type: String,
    required: true,
    default: 'Software Engineer'
  },
  skills: {
    type: [String],
    default: []
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  readinessScore: {
    type: Number,
    default: 0
  },
  resumeScore: {
    type: Number,
    default: 0
  },
  missingSkills: [{
    skill: String,
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CareerProfile', CareerProfileSchema);
