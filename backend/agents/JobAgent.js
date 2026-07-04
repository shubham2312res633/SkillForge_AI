const BaseAgent = require('./BaseAgent');
const { callTool } = require('../mcp/client');

class JobAgent extends BaseAgent {
  constructor() {
    super({
      name: 'JobAgent',
      role: 'Recruitment Matching Consultant',
      goal: 'Identify industry job listings matching candidate credentials and provide compatibility indicators.',
      systemInstruction: 'You parse candidate competencies, cross-reference them with active postings, and identify gaps preventing candidate hiring.'
    });
  }

  async run(userId, skills, targetRole) {
    await this.logActivity(userId, 'Searching compatible job postings', 'running', `Querying openings for: ${targetRole}`);
    
    try {
      const mcpResponse = await callTool('job_search_tool', { skills, targetRole });
      
      if (mcpResponse.isError) {
        throw new Error(mcpResponse.content[0].text);
      }

      const jobResults = JSON.parse(mcpResponse.content[0].text);
      
      await this.logActivity(
        userId,
        'Compatible job vacancies found',
        'success',
        `Returned ${jobResults.jobs?.length || 0} listings with suitability scores.`
      );

      return jobResults;
    } catch (error) {
      await this.logActivity(userId, 'Job mapping search failed', 'failed', error.message);
      throw error;
    }
  }
}

module.exports = new JobAgent();
