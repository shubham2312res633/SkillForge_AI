const BaseAgent = require('./BaseAgent');
const { callTool } = require('../mcp/client');

class ResumeAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ResumeAgent',
      role: 'Professional Resume Analyst',
      goal: 'Parse, score, and find gaps or structural improvements in candidate resumes.',
      systemInstruction: 'You are an elite recruiter. Provide strict, professional evaluation of resumes, scoring them out of 100.'
    });
  }

  async run(userId, rawText, fileName) {
    await this.logActivity(userId, 'Starting resume analysis', 'running', `Analyzing file: ${fileName}`);
    
    try {
      // Call the resume_parser_tool via MCP client
      const mcpResponse = await callTool('resume_parser_tool', { rawText });
      
      if (mcpResponse.isError) {
        throw new Error(mcpResponse.content[0].text);
      }

      const parsedData = JSON.parse(mcpResponse.content[0].text);
      
      await this.logActivity(
        userId, 
        'Resume analysis completed', 
        'success', 
        `Extracted name: ${parsedData.name}, Skills count: ${parsedData.skills?.length || 0}. Score: ${parsedData.resume_score}/100`
      );

      return parsedData;
    } catch (error) {
      await this.logActivity(userId, 'Resume analysis failed', 'failed', error.message);
      throw error;
    }
  }
}

module.exports = new ResumeAgent();
