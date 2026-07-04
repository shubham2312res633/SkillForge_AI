const BaseAgent = require('./BaseAgent');
const { callTool } = require('../mcp/client');

class SkillAgent extends BaseAgent {
  constructor() {
    super({
      name: 'SkillAgent',
      role: 'Career Strategy Specialist',
      goal: 'Evaluate the discrepancies between candidates current skill sets and target industry positions.',
      systemInstruction: 'You compare skills profiles with role expectations and output prioritizing items categorized by HIGH, MEDIUM, and LOW requirements.'
    });
  }

  async run(userId, profile, targetRole) {
    await this.logActivity(userId, 'Analyzing skill gaps', 'running', `Comparing skills against target role: ${targetRole}`);
    
    try {
      const mcpResponse = await callTool('career_analyzer_tool', { profile, targetRole });
      
      if (mcpResponse.isError) {
        throw new Error(mcpResponse.content[0].text);
      }

      const gapData = JSON.parse(mcpResponse.content[0].text);
      
      await this.logActivity(
        userId,
        'Skill gaps calculated',
        'success',
        `Identified ${gapData.missingSkills?.length || 0} gaps. Career readiness score estimated at ${gapData.readinessScore}%`
      );

      return gapData;
    } catch (error) {
      await this.logActivity(userId, 'Skill gap calculation failed', 'failed', error.message);
      throw error;
    }
  }
}

module.exports = new SkillAgent();
