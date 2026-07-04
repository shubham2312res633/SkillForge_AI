const { generateStructuredJSON } = require('../config/gemini');

const roadmapGeneratorTool = async (missingSkills, targetRole) => {
  const systemInstruction = `You are an educational designer and expert software engineer.
Generate a structured, month-by-month learning roadmap to help a user learn the provided missing skills for their target role.
You MUST output raw JSON matching this schema exactly:
{
  "months": [
    {
      "month": "Month 1: [Focus Area]",
      "topics": ["Subtopic A", "Subtopic B"],
      "timeRequired": "4 weeks",
      "projects": [
        {
          "title": "Project Title",
          "description": "Detailed project brief",
          "skills": ["Skill used"],
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "reason": "Why this project is relevant to their target role"
        }
      ],
      "resources": [
        {
          "name": "Course/Article name",
          "url": "https://example.com/learn",
          "type": "Video" | "Documentation" | "Article"
        }
      ],
      "milestones": ["Milestone 1: Build the backend server"]
    }
  ]
}
Include realistic educational resources. Typically output 3 months.`;

  const prompt = `Create a 3-month roadmap for target role: "${targetRole}".
  Missing Skills to learn: ${JSON.stringify(missingSkills)}`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('Gemini API Key missing. Returning mock roadmap.');
      return getMockRoadmap(missingSkills, targetRole);
    }

    const roadmap = await generateStructuredJSON(prompt, systemInstruction);
    return roadmap;
  } catch (error) {
    console.error('Error in roadmapGeneratorTool:', error);
    return getMockRoadmap(missingSkills, targetRole);
  }
};

const getMockRoadmap = (missingSkills, targetRole) => {
  const skillsList = missingSkills.map(item => typeof item === 'string' ? item : item.skill);
  
  return {
    months: [
      {
        month: 'Month 1: Foundations & Core Technologies',
        topics: [
          skillsList[0] || 'Core Language Syntax',
          skillsList[1] || 'Basic Architecture & Setup',
          'Git & Collaborative Workflows'
        ],
        timeRequired: '4 weeks',
        projects: [
          {
            title: `SkillForge Sandbox Base`,
            description: `A basic prototype implementation of a ${targetRole} pipeline incorporating fundamental features.`,
            skills: [skillsList[0] || 'Core Stack'],
            difficulty: 'Beginner',
            reason: 'Helps solidify early syntactical syntax and execution setups.'
          }
        ],
        resources: [
          {
            name: `${skillsList[0] || 'Core Stack'} Official Docs`,
            url: 'https://developer.mozilla.org/en-US/',
            type: 'Documentation'
          },
          {
            name: 'Git Version Control Crash Course',
            url: 'https://git-scm.com/doc',
            type: 'Article'
          }
        ],
        milestones: [
          'Setup local developer environment',
          'Deploy first mock prototype'
        ]
      },
      {
        month: 'Month 2: Scaling & Data Integrity',
        topics: [
          skillsList[2] || 'Database Integration & Security',
          skillsList[3] || 'Caching & Optimization techniques',
          'JSON Web Tokens & Auth workflows'
        ],
        timeRequired: '4 weeks',
        projects: [
          {
            title: `Distributed Multi-user Hub`,
            description: `A full-stack implementation adding storage, indexing, and authorization schemas.`,
            skills: [skillsList[2] || 'Databases', 'Authentication'],
            difficulty: 'Intermediate',
            reason: 'Improves stateful execution workflows and ensures security compliance.'
          }
        ],
        resources: [
          {
            name: 'Modern Web Architecture Guidelines',
            url: 'https://v8.dev/',
            type: 'Article'
          }
        ],
        milestones: [
          'Integrate stateful database models',
          'Secure routes with tokens'
        ]
      },
      {
        month: 'Month 3: Containerization & Cloud Deployment',
        topics: [
          skillsList[4] || 'Docker Containers & Pipelines',
          skillsList[5] || 'Cloud Providers (AWS/GCP)',
          'Advanced System Design concepts'
        ],
        timeRequired: '4 weeks',
        projects: [
          {
            title: `Enterprise Production Deploy`,
            description: `Wrap the entire application in containers and run it in a containerized environment (e.g. Docker Compose) with CI/CD automation.`,
            skills: [skillsList[4] || 'Docker', 'CI/CD'],
            difficulty: 'Advanced',
            reason: 'Demonstrates industry-standard container configuration and operations.'
          }
        ],
        resources: [
          {
            name: 'Docker Official Get Started Guide',
            url: 'https://docs.docker.com/get-started/',
            type: 'Documentation'
          }
        ],
        milestones: [
          'Write a working multi-stage Dockerfile',
          'Simulate system architectural scaling'
        ]
      }
    ]
  };
};

module.exports = roadmapGeneratorTool;
