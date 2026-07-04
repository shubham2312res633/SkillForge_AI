const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CareerProfile = require('../models/CareerProfile');
const Resume = require('../models/Resume');
const CareerOrchestrator = require('../agents/CareerOrchestrator');

// Get Career Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Career profile not found. Please upload a resume first.' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Target Role / Goal selection (Runs re-orchestration on existing resume)
router.post('/goal', auth, async (req, res) => {
  const { targetRole } = req.body;
  if (!targetRole) {
    return res.status(400).json({ message: 'Please provide a target career goal.' });
  }

  try {
    // Find the user's latest resume
    const latestResumes = await Resume.find({ userId: req.user.id }).sort({ uploadedAt: -1 }).limit(1);
    const latestResume = latestResumes[0];
    
    if (latestResume) {
      // Re-run orchestrator workflow with existing resume but new target role
      const results = await CareerOrchestrator.runWorkflow(
        req.user.id, 
        latestResume.rawText, 
        latestResume.fileName, 
        targetRole
      );
      return res.json({
        message: `Career trajectory updated to ${targetRole} and profiles recalculated.`,
        results
      });
    }

    // If no resume uploaded yet, create/update basic profile
    const profile = await CareerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { targetRole, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    
    res.json({
      message: `Goal updated to ${targetRole}. Complete profile analysis will run once a resume is uploaded.`,
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
