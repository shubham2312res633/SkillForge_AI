const AgentActivity = require('../models/AgentActivity');
const { generateText, generateStructuredJSON } = require('../config/gemini');

class BaseAgent {
  constructor({ name, role, goal, systemInstruction }) {
    this.name = name;
    this.role = role;
    this.goal = goal;
    this.systemInstruction = systemInstruction || `${role}. Goal: ${goal}`;
  }

  async logActivity(userId, action, status = 'running', details = '') {
    console.log(`[AGENT ${this.name}] ${action} (${status}) - ${details}`);
    try {
      await AgentActivity.create({
        userId,
        agentName: this.name,
        action,
        status,
        details
      });
    } catch (error) {
      console.error(`Error saving activity log for ${this.name}:`, error);
    }
  }

  async askAI(prompt, systemInstructionOverride = '') {
    const instruction = systemInstructionOverride || this.systemInstruction;
    return await generateText(prompt, instruction);
  }

  async askAIStructured(prompt, systemInstructionOverride = '') {
    const instruction = systemInstructionOverride || this.systemInstruction;
    return await generateStructuredJSON(prompt, instruction);
  }
}

module.exports = BaseAgent;
