const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const Progress = require('../models/Progress');
const memoryTool = require('../tools/memoryTool');

// Get current Roadmap
router.get('/', auth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(1);
    const roadmap = roadmaps[0];
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found. Please upload a resume first.' });
    }
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle study topic completion
router.post('/toggle-topic', auth, async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ message: 'Topic name is required.' });
  }

  try {
    const progress = await Progress.findOne({ userId: req.user.id });
    const isCompleted = progress?.completedTopics.includes(topic);
    
    let updatedProgress;
    if (isCompleted) {
      // Remove topic
      updatedProgress = await Progress.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { completedTopics: topic }, $inc: { overallCareerScore: -4 } },
        { new: true }
      );
    } else {
      // Add topic
      updatedProgress = await memoryTool.saveProgress(req.user.id, topic, null, 4);
    }

    res.json({
      message: `Topic status updated.`,
      progress: updatedProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle milestone project completion
router.post('/toggle-project', auth, async (req, res) => {
  const { projectTitle } = req.body;
  if (!projectTitle) {
    return res.status(400).json({ message: 'Project title is required.' });
  }

  try {
    const progress = await Progress.findOne({ userId: req.user.id });
    const isCompleted = progress?.completedProjects.includes(projectTitle);

    let updatedProgress;
    if (isCompleted) {
      // Remove project
      updatedProgress = await Progress.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { completedProjects: projectTitle }, $inc: { overallCareerScore: -15 } },
        { new: true }
      );
    } else {
      // Add project
      updatedProgress = await memoryTool.saveProgress(req.user.id, null, projectTitle, 15);
    }

    res.json({
      message: 'Project completion status updated.',
      progress: updatedProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
