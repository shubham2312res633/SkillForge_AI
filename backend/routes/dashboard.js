const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CareerProfile = require('../models/CareerProfile');
const Progress = require('../models/Progress');
const Roadmap = require('../models/Roadmap');
const AgentActivity = require('../models/AgentActivity');

// Get Dashboard overview stats
router.get('/stats', auth, async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({ userId: req.user.id });
    const progress = await Progress.findOne({ userId: req.user.id });
    const roadmaps = await Roadmap.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(1);
    const roadmap = roadmaps[0];

    const totalTopicsCount = roadmap 
      ? roadmap.months.reduce((acc, month) => acc + month.topics.length, 0)
      : 0;

    res.json({
      targetRole: profile?.targetRole || 'Not Set',
      resumeScore: profile?.resumeScore || 0,
      readinessScore: profile?.readinessScore || 0,
      overallCareerScore: progress?.overallCareerScore || 30,
      completedTopicsCount: progress?.completedTopics?.length || 0,
      completedProjectsCount: progress?.completedProjects?.length || 0,
      totalTopicsCount,
      skills: profile?.skills || [],
      missingSkills: profile?.missingSkills || [],
      strengths: profile?.strengths || [],
      weaknesses: profile?.weaknesses || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch active agent activity logs
router.get('/activity', auth, async (req, res) => {
  try {
    const logs = await AgentActivity.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
