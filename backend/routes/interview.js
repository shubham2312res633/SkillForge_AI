const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');
const InterviewAgent = require('../agents/InterviewAgent');

// Start a new mock interview
router.post('/start', auth, async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ message: 'Topic is required.' });
  }

  try {
    const welcomeMessage = `Hello! I will be conducting your technical interview for the ${topic} position today. To start, could you please introduce yourself and outline your experience with this tech stack?`;
    
    const newInterview = await Interview.create({
      userId: req.user.id,
      topic,
      history: [
        {
          role: 'interviewer',
          message: welcomeMessage,
          timestamp: Date.now()
        }
      ],
      status: 'ongoing'
    });

    res.status(201).json(newInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a message in the interview chat and get response
router.post('/chat', auth, async (req, res) => {
  const { interviewId, message } = req.body;

  if (!interviewId || !message) {
    return res.status(400).json({ message: 'Interview ID and message are required.' });
  }

  try {
    const interviewSession = await Interview.findById(interviewId);
    if (!interviewSession) {
      return res.status(404).json({ message: 'Interview session not found.' });
    }

    if (interviewSession.status === 'completed') {
      return res.status(400).json({ message: 'This interview has already been evaluated and closed.' });
    }

    if (interviewSession.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to this interview session.' });
    }

    // Call InterviewAgent logic
    const response = await InterviewAgent.generateNextQuestion(req.user.id, interviewSession, message);
    
    res.json(response);
  } catch (error) {
    console.error('Interview chat error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Fetch past interview assessments
router.get('/history', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id, status: 'completed' }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch specific interview detail
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    if (interview.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
