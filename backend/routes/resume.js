const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const auth = require('../middleware/auth');
const CareerOrchestrator = require('../agents/CareerOrchestrator');
const Resume = require('../models/Resume');

// Set up Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limit to 5MB
});

// Upload and Analyze Resume
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    let rawText = '';
    let fileName = '';

    if (req.file) {
      fileName = req.file.originalname;
      const extension = fileName.split('.').pop().toLowerCase();
      
      if (extension === 'pdf') {
        const parsedPdf = await pdf(req.file.buffer);
        rawText = parsedPdf.text;
      } else {
        // Fallback for TXT or other raw formats
        rawText = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.text) {
      // Direct text submission fallback
      rawText = req.body.text;
      fileName = 'pasted_text.txt';
    } else {
      return res.status(400).json({ message: 'Please upload a file or provide resume text.' });
    }

    if (!rawText.trim()) {
      return res.status(400).json({ message: 'The resume content appears to be empty.' });
    }

    const targetRole = req.body.targetRole || 'Software Engineer';
    
    // Execute the Multi-Agent workflow asynchronously
    const results = await CareerOrchestrator.runWorkflow(req.user.id, rawText, fileName, targetRole);

    res.json({
      message: 'Resume analyzed and career strategy structured successfully.',
      results
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Fetch user's active resumes
router.get('/history', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
