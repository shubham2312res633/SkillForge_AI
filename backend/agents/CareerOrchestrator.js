const BaseAgent = require('./BaseAgent');
const ResumeAgent = require('./ResumeAgent');
const SkillAgent = require('./SkillAgent');
const RoadmapAgent = require('./RoadmapAgent');
const ProjectAgent = require('./ProjectAgent');
const JobAgent = require('./JobAgent');
const MemoryAgent = require('./MemoryAgent');
const SecurityAgent = require('./SecurityAgent');

class CareerOrchestrator extends BaseAgent {
  constructor() {
    super({
      name: 'CareerOrchestrator',
      role: 'Career Success Director',
      goal: 'Orchestrate candidate skills extraction, identify job alignment opportunities, structure monthly learning guidelines, and optimize final readiness ratings.',
      systemInstruction: 'You act as the primary coordinator router, invoking individual sub-agents and combining outputs.'
    });
  }

  async runWorkflow(userId, rawResumeText, fileName, targetRole = 'Software Engineer') {
    await this.logActivity(userId, 'Initializing multi-agent workflow', 'running', `Goal: Analyze resume & structure career growth as ${targetRole}`);
    
    try {
      // 1. Security Check & Redaction
      const sanitizedResumeText = await SecurityAgent.runAudit(userId, rawResumeText, 'User Upload');
      
      // 2. Resume Parsing & Scoring
      const parsedResume = await ResumeAgent.run(userId, sanitizedResumeText, fileName);
      
      // Save raw resume record
      const resumeRecord = await MemoryAgent.callTool('memory_tool', {
        action: 'write_profile',
        userId,
        data: {
          skills: parsedResume.skills,
          strengths: parsedResume.strengths,
          weaknesses: parsedResume.weaknesses,
          resumeScore: parsedResume.resume_score,
          targetRole
        }
      });

      // Save complete resume file record
      await require('../models/Resume').create({
        userId,
        fileName,
        rawText: sanitizedResumeText,
        parsedData: parsedResume
      });

      // 3. Skill Gap Analysis
      const gapReport = await SkillAgent.run(userId, parsedResume, targetRole);

      // Save career profile with gap analysis
      const careerProfile = await MemoryAgent.callTool('memory_tool', {
        action: 'write_profile',
        userId,
        data: {
          targetRole,
          skills: parsedResume.skills,
          strengths: gapReport.strengths,
          weaknesses: gapReport.weaknesses,
          readinessScore: gapReport.readinessScore,
          resumeScore: parsedResume.resume_score,
          missingSkills: gapReport.missingSkills
        }
      });

      // 4. Roadmap Generation
      const roadmapData = await RoadmapAgent.run(userId, gapReport.missingSkills, targetRole);
      
      // Save roadmap configuration
      await MemoryAgent.callTool('memory_tool', {
        action: 'write_profile', // We will write using direct model save
        userId,
        data: {} // handled below
      });
      
      await require('../models/Roadmap').create({
        userId,
        targetRole,
        months: roadmapData.months
      });

      // 5. Project Recommender
      const projectRecs = await ProjectAgent.run(userId, gapReport.missingSkills, targetRole);

      // 6. Job Matching
      const matchedJobs = await JobAgent.run(userId, parsedResume.skills, targetRole);

      // 7. Initialize Progress Log
      await MemoryAgent.callTool('memory_tool', {
        action: 'write_progress',
        userId,
        data: {
          completedTopic: null,
          completedProject: null,
          scoreChange: 0
        }
      });
      
      const progressRecord = await require('../models/Progress').findOne({ userId });
      progressRecord.overallCareerScore = Math.round((parsedResume.resume_score + gapReport.readinessScore) / 2);
      await progressRecord.save();

      await this.logActivity(
        userId, 
        'Multi-agent workflow execution complete', 
        'success', 
        `User is job-ready at: ${progressRecord.overallCareerScore}% accuracy match.`
      );

      return {
        parsedResume,
        gapReport,
        roadmap: roadmapData,
        projects: projectRecs.recommendations,
        jobs: matchedJobs.jobs,
        careerScore: progressRecord.overallCareerScore
      };
    } catch (error) {
      await this.logActivity(userId, 'Multi-agent workflow execution failed', 'failed', error.message);
      throw error;
    }
  }
}

module.exports = new CareerOrchestrator();
