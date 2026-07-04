const BaseAgent = require('./BaseAgent');
const { callTool } = require('../mcp/client');

class MemoryAgent extends BaseAgent {
  constructor() {
    super({
      name: 'MemoryAgent',
      role: 'Long-term Memory Keeper',
      goal: 'Maintain and query historical profiles, logs, scores, and study accomplishments for the candidate.',
      systemInstruction: 'You act as an agent memory buffer, recording completed milestones and retrieving career profile configurations.'
    });
  }

  async callTool(toolName, args) {
    try {
      return await callTool(toolName, args);
    } catch (error) {
      console.error(`MemoryAgent callTool error for ${toolName}:`, error);
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const response = await callTool('memory_tool', { action: 'read_profile', userId });
      if (response.isError) throw new Error(response.content[0].text);
      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('MemoryAgent getProfile error:', error);
      throw error;
    }
  }

  async saveProfile(userId, profileData) {
    try {
      const response = await callTool('memory_tool', { action: 'write_profile', userId, data: profileData });
      if (response.isError) throw new Error(response.content[0].text);
      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('MemoryAgent saveProfile error:', error);
      throw error;
    }
  }

  async getProgress(userId) {
    try {
      const response = await callTool('memory_tool', { action: 'read_progress', userId });
      if (response.isError) throw new Error(response.content[0].text);
      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('MemoryAgent getProgress error:', error);
      throw error;
    }
  }

  async saveProgress(userId, completedTopic, completedProject, scoreChange = 0) {
    try {
      const response = await callTool('memory_tool', { 
        action: 'write_progress', 
        userId, 
        data: { completedTopic, completedProject, scoreChange } 
      });
      if (response.isError) throw new Error(response.content[0].text);
      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('MemoryAgent saveProgress error:', error);
      throw error;
    }
  }
}

module.exports = new MemoryAgent();
