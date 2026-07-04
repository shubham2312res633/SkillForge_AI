const mongoose = require('mongoose');

const AgentActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['running', 'success', 'failed'],
    default: 'running'
  },
  details: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AgentActivity', AgentActivitySchema);
