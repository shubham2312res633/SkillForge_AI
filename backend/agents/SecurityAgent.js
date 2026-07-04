const BaseAgent = require('./BaseAgent');
const { redactPII } = require('../middleware/security');

class SecurityAgent extends BaseAgent {
  constructor() {
    super({
      name: 'SecurityAgent',
      role: 'Chief Data Privacy & Action Officer',
      goal: 'Audit system inputs and outputs to prevent leakage of PII (emails, phone numbers) and ensure agents operate safely within guidelines.',
      systemInstruction: 'You audit all incoming data and validate that agent outputs do not leak personal records.'
    });
  }

  async runAudit(userId, text, sourceAgent) {
    await this.logActivity(userId, 'Auditing data for privacy risk', 'running', `Scanning payload from source: ${sourceAgent}`);

    const sanitized = redactPII(text);
    const leakedEmail = text.includes('[EMAIL_REDACTED]') || sanitized !== text;

    if (leakedEmail) {
      await this.logActivity(
        userId, 
        'PII Redacted successfully', 
        'success', 
        `Security Agent intercepted and masked email/phone in payload before forwarding to AI models.`
      );
    } else {
      await this.logActivity(userId, 'Payload audit clean', 'success', 'No sensitive information found.');
    }

    return sanitized;
  }

  validateAction(userId, agentName, action, payload) {
    const serialized = JSON.stringify(payload);
    
    // Block basic injection attempts or unsafe system actions
    const hasOverride = serialized.toLowerCase().includes('override system prompt') || 
                        serialized.toLowerCase().includes('delete database') ||
                        serialized.toLowerCase().includes('format c:');

    if (hasOverride) {
      this.logActivity(userId, 'Agent action blocked', 'failed', `${agentName} attempted unsafe execution: ${action}`);
      return false;
    }

    return true;
  }
}

module.exports = new SecurityAgent();
