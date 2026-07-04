const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['interviewer', 'user'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  history: [MessageSchema],
  score: {
    type: Number,
    default: 0
  },
  feedback: {
    technicalCorrectness: { type: String, default: '' },
    communication: { type: String, default: '' },
    problemSolving: { type: String, default: '' },
    keyWeakness: { type: String, default: '' },
    recommendations: { type: [String], default: [] }
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', InterviewSchema);
