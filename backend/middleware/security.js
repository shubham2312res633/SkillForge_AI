const redactPII = (text) => {
  if (typeof text !== 'string') return text;
  
  // Email regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  // Phone regex (e.g. +1-123-456-7890, 123-456-7890, (123) 456-7890, etc.)
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  
  let redacted = text.replace(emailRegex, '[EMAIL_REDACTED]');
  redacted = redacted.replace(phoneRegex, '[PHONE_REDACTED]');
  
  return redacted;
};

const securityFilter = (req, res, next) => {
  try {
    // Audit payload for suspicious injection patterns
    const payloadStr = JSON.stringify(req.body);
    
    // Check for prompt injection signatures in inputs
    const injectionSignatures = [
      "ignore previous instructions",
      "bypass safety filters",
      "system prompt override",
      "you are now developer mode"
    ];
    
    const lowerPayload = payloadStr.toLowerCase();
    const hasInjection = injectionSignatures.some(sig => lowerPayload.includes(sig));
    
    if (hasInjection) {
      return res.status(400).json({ 
        message: 'Security warning: Potential adversarial prompt injection detected and blocked.' 
      });
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  redactPII,
  securityFilter
};
