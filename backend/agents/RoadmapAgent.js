const BaseAgent = require('./BaseAgent');
const { callTool } = require('../mcp/client');

class RoadmapAgent extends BaseAgent {
  constructor() {
    super({
      name: 'RoadmapAgent',
      role: 'Curriculum Architect',
      goal: 'Produce optimized, project-oriented learning plans designed to resolve professional skill gaps.',
      systemInstruction: 'You translate missing technological requirements into concrete monthly study tasks, resources, and actionable steps.'
    });
  }

  async run(userId, missingSkills, targetRole) {
    await this.logActivity(userId, 'Creating structured career roadmap', 'running', `Mapping study steps for ${missingSkills.length} missing skill topics.`);
    
    try {
      const mcpResponse = await callTool('roadmap_generator_tool', { missingSkills, targetRole });
      
      if (mcpResponse.isError) {
        throw new Error(mcpResponse.content[0].text);
      }

      const roadmapData = JSON.parse(mcpResponse.content[0].text);
      
      await this.logActivity(
        userId,
        'Personalized roadmap generated',
        'success',
        `Curated learning path containing ${roadmapData.months?.length || 0} training modules.`
      );

      return roadmapData;
    } catch (error) {
      await this.logActivity(userId, 'Roadmap generation failed', 'failed', error.message);
      throw error;
    }
  }
}

module.exports = new RoadmapAgent();
