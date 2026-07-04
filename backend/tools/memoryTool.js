const CareerProfile = require('../models/CareerProfile');
const Resume = require('../models/Resume');
const Roadmap = require('../models/Roadmap');
const Interview = require('../models/Interview');
const Progress = require('../models/Progress');

const memoryTool = {
  getCareerProfile: async (userId) => {
    return await CareerProfile.findOne({ userId });
  },

  saveCareerProfile: async (userId, data) => {
    return await CareerProfile.findOneAndUpdate(
      { userId },
      { ...data, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
  },

  getResume: async (userId) => {
    const resumes = await Resume.find({ userId }).sort({ uploadedAt: -1 }).limit(1);
    return resumes[0] || null;
  },

  saveResume: async (userId, data) => {
    return await Resume.create({
      userId,
      fileName: data.fileName,
      rawText: data.rawText,
      parsedData: data.parsedData
    });
  },

  getRoadmap: async (userId) => {
    const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 }).limit(1);
    return roadmaps[0] || null;
  },

  saveRoadmap: async (userId, data) => {
    return await Roadmap.create({
      userId,
      targetRole: data.targetRole,
      months: data.months
    });
  },

  getInterviews: async (userId) => {
    return await Interview.find({ userId }).sort({ createdAt: -1 });
  },

  getInterview: async (interviewId) => {
    return await Interview.findById(interviewId);
  },

  saveInterview: async (userId, data) => {
    if (data.id) {
      return await Interview.findByIdAndUpdate(
        data.id,
        { 
          history: data.history, 
          score: data.score, 
          feedback: data.feedback,
          status: data.status 
        },
        { new: true }
      );
    } else {
      return await Interview.create({
        userId,
        topic: data.topic,
        history: data.history || [],
        status: data.status || 'ongoing'
      });
    }
  },

  getProgress: async (userId) => {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = await Progress.create({ userId, completedTopics: [], completedProjects: [], overallCareerScore: 30 });
    }
    return progress;
  },

  saveProgress: async (userId, completedTopic, completedProject, scoreChange = 0) => {
    const progress = await memoryTool.getProgress(userId);
    
    if (completedTopic && !progress.completedTopics.includes(completedTopic)) {
      progress.completedTopics.push(completedTopic);
    }
    if (completedProject && !progress.completedProjects.includes(completedProject)) {
      progress.completedProjects.push(completedProject);
    }
    
    if (scoreChange !== 0) {
      progress.overallCareerScore = Math.min(100, Math.max(0, progress.overallCareerScore + scoreChange));
    } else {
      // Calculate based on number of completed items
      const base = 35;
      const topicsWeight = progress.completedTopics.length * 4;
      const projectsWeight = progress.completedProjects.length * 15;
      progress.overallCareerScore = Math.min(98, base + topicsWeight + projectsWeight);
    }
    
    progress.updatedAt = Date.now();
    return await progress.save();
  }
};

module.exports = memoryTool;
