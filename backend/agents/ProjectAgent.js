const BaseAgent = require('./BaseAgent');

class ProjectAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ProjectAgent',
      role: 'Technical Advisor & Lead Developer',
      goal: 'Propose advanced engineering projects designed to bridge technical gaps and display capability to potential employers.',
      systemInstruction: 'You recommend architectural projects specifying their tech stacks, difficulty levels, implementation reasons, and core features.'
    });
  }

  async run(userId, missingSkills, targetRole) {
    await this.logActivity(userId, 'Creating tailored project recommendations', 'running', `Selecting project scopes that teach missing skills: ${JSON.stringify(missingSkills.map(s => s.skill || s))}`);

    const prompt = `Based on the target role "${targetRole}" and missing skills: ${JSON.stringify(missingSkills)}, suggest 2 highly relevant portfolio projects.
    Return JSON format:
    {
      "recommendations": [
        {
          "title": "Project Title",
          "description": "Details",
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "skillsLearned": ["Skill"],
          "stack": ["Technology"],
          "architecture": "Describe architectural highlights",
          "reason": "Why this improves their profile"
        }
      ]
    }`;

    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        // Return Mock fallback
        const mockProjs = this.getMockRecommendations(targetRole);
        await this.logActivity(userId, 'Project recommendation complete', 'success', `Suggested projects: ${mockProjs.recommendations.map(p=>p.title).join(', ')}`);
        return mockProjs;
      }

      const res = await this.askAIStructured(prompt);
      await this.logActivity(userId, 'Project recommendation complete', 'success', `Suggested ${res.recommendations?.length || 0} projects.`);
      return res;
    } catch (error) {
      console.error('ProjectAgent error:', error);
      const mockProjs = this.getMockRecommendations(targetRole);
      await this.logActivity(userId, 'Project recommendation completed (fallback)', 'success', `Suggested projects: ${mockProjs.recommendations.map(p=>p.title).join(', ')}`);
      return mockProjs;
    }
  }

  getMockRecommendations(targetRole) {
    const roleLower = targetRole.toLowerCase();
    if (roleLower.includes('backend')) {
      return {
        recommendations: [
          {
            title: 'Distributed Task Queue System',
            description: 'A background worker queue system using Redis for storing job state and Node.js workers to process jobs concurrently.',
            difficulty: 'Advanced',
            skillsLearned: ['Redis', 'Node.js', 'System Design', 'Concurrency'],
            stack: ['Node.js', 'Redis', 'Docker', 'BullMQ'],
            architecture: 'Publisher-Subscriber queue model with multiple decoupled worker processes.',
            reason: 'Demonstrates understanding of asynchronous message brokers and horizontally scaling background compute nodes.'
          },
          {
            title: 'GraphQL API Gateway & Auth Service',
            description: 'An API gateway routing requests to multiple microservices with integrated token authentication and rate limiting.',
            difficulty: 'Intermediate',
            skillsLearned: ['API Design', 'Express', 'Auth', 'MongoDB'],
            stack: ['Express', 'GraphQL', 'JWT', 'MongoDB'],
            architecture: 'Gateway architecture routing requests to stateless service nodes.',
            reason: 'Essential backend design pattern demonstrating enterprise-level security and unified routing layouts.'
          }
        ]
      };
    } else if (roleLower.includes('frontend')) {
      return {
        recommendations: [
          {
            title: 'Collaborative Kanban Workspace',
            description: 'A rich visual board editor featuring drag-and-drop mechanics, nested subtasks, and offline sync updates.',
            difficulty: 'Intermediate',
            skillsLearned: ['React.js', 'Vite', 'State management', 'HTML5 Drag & Drop'],
            stack: ['React', 'Zustand', 'Vanilla CSS', 'IndexedDB'],
            architecture: 'Unidirectional data flow synchronized locally via service workers.',
            reason: 'Visual-heavy application demonstrating state-of-the-art UI coordination and offline capabilities.'
          }
        ]
      };
    } else {
      return {
        recommendations: [
          {
            title: 'Smart Analytics Predictive Model',
            description: 'An analytical dashboard training lightweight predictions on tabular data using statistical metrics.',
            difficulty: 'Intermediate',
            skillsLearned: ['Python', 'SQL', 'Data Operations'],
            stack: ['Python', 'Pandas', 'Scikit-Learn', 'ChartJS'],
            architecture: 'Client-server pipeline fetching aggregated metrics and predicting targets.',
            reason: 'Combines engineering pipelines with mathematical evaluations for high-value analytics.'
          }
        ]
      };
    }
  }
}

module.exports = new ProjectAgent();
