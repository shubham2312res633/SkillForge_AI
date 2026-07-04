const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  rawText: {
    type: String,
    default: ''
  },
  parsedData: {
    name: { type: String, default: '' },
    skills: { type: [String], default: [] },
    projects: { type: [mongoose.Schema.Types.Mixed], default: [] },
    experience: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    resume_score: { type: Number, default: 0 }
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', ResumeSchema);
