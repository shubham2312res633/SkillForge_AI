const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('WARNING: Gemini API Key is missing. Using mocked responses.');
      return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

const generateStructuredJSON = async (prompt, systemInstruction = '') => {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('Gemini API client not initialized. Set GEMINI_API_KEY.');
  }

  // Use gemini-2.5-flash as the standard robust model
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction || undefined
  });

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const response = result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini generateStructuredJSON error:', error);
    throw error;
  }
};

const generateText = async (prompt, systemInstruction = '') => {
  const ai = getGenAI();
  if (!ai) {
    return 'Mocked response: Set GEMINI_API_KEY to get real AI output.';
  }

  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction || undefined
  });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini generateText error:', error);
    throw error;
  }
};

module.exports = {
  getGenAI,
  generateStructuredJSON,
  generateText
};
