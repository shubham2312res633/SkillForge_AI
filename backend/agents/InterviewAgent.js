const BaseAgent = require('./BaseAgent');
const memoryTool = require('../tools/memoryTool');

class InterviewAgent extends BaseAgent {
  constructor() {
    super({
      name: 'InterviewAgent',
      role: 'Principal Interviewer & Technical Assessor',
      goal: 'Conduct professional mock interviews, assess responses for technical correctness, and supply structured feedback.',
      systemInstruction: 'You are conducting a professional mock technical interview. Ask one targeted question at a time. Maintain a helpful yet rigorous tone.'
    });
  }

  async generateNextQuestion(userId, interviewSession, userMessage) {
    await this.logActivity(userId, 'Processing interview response', 'running', `Interviewer analyzing candidate answer.`);
    
    // Add user message to history
    interviewSession.history.push({
      role: 'user',
      message: userMessage,
      timestamp: Date.now()
    });

    const userTurnsCount = interviewSession.history.filter(m => m.role === 'user').length;
    
    // If we have asked 3 questions and received answers, evaluate the interview!
    if (userTurnsCount >= 3) {
      return await this.evaluateInterview(userId, interviewSession);
    }

    // Otherwise, generate the next interview question
    const conversationPrompt = `You are interviewing a candidate for a role.
    Role: ${interviewSession.topic}
    Conversation Transcript:
    ${interviewSession.history.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.message}`).join('\n')}
    
    Based on the transcript, briefly react to the candidate's last answer, then ask the next technical question. 
    Keep your response concise and professional (maximum 3 sentences). Do not include any JSON or metadata.`;

    try {
      let nextQuestion = '';
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        nextQuestion = this.getMockNextQuestion(interviewSession.topic, userTurnsCount);
      } else {
        nextQuestion = await this.askAI(conversationPrompt);
      }

      interviewSession.history.push({
        role: 'interviewer',
        message: nextQuestion,
        timestamp: Date.now()
      });

      await interviewSession.save();
      await this.logActivity(userId, 'Interviewer asked next question', 'success', `Turn ${userTurnsCount + 1}`);
      return { interviewSession, finished: false, nextMessage: nextQuestion };
    } catch (error) {
      console.error('InterviewAgent error:', error);
      const fallbackMsg = 'That is an interesting answer. Can you explain how you would handle scale and caching in this setup?';
      interviewSession.history.push({
        role: 'interviewer',
        message: fallbackMsg,
        timestamp: Date.now()
      });
      await interviewSession.save();
      return { interviewSession, finished: false, nextMessage: fallbackMsg };
    }
  }

  async evaluateInterview(userId, interviewSession) {
    await this.logActivity(userId, 'Evaluating overall interview performance', 'running', `Analyzing answers...`);

    const evalPrompt = `You are evaluating a completed technical interview.
    Role: ${interviewSession.topic}
    Transcript:
    ${interviewSession.history.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.message}`).join('\n')}
    
    Evaluate the candidate's technical correctness, communication skills, and problem solving capability.
    Return JSON ONLY matching the following schema:
    {
      "score": 75,
      "feedback": {
        "technicalCorrectness": "Brief assessment of technical depth",
        "communication": "Brief assessment of verbal clarity and tone",
        "problemSolving": "Brief assessment of engineering approach",
        "keyWeakness": "The single most prominent weakness identified",
        "recommendations": ["Recommendation 1", "Recommendation 2"]
      }
    }`;

    try {
      let evaluation = null;
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        evaluation = this.getMockEvaluation(interviewSession.topic);
      } else {
        evaluation = await this.askAIStructured(evalPrompt);
      }

      interviewSession.score = evaluation.score;
      interviewSession.feedback = evaluation.feedback;
      interviewSession.status = 'completed';
      
      await interviewSession.save();
      
      // Update User Progress Score
      await memoryTool.saveProgress(userId, null, null, Math.round((evaluation.score - 50) / 5));

      await this.logActivity(
        userId, 
        'Interview evaluation completed', 
        'success', 
        `Final Score: ${evaluation.score}/100. Key Weakness: ${evaluation.feedback.keyWeakness}`
      );

      return { interviewSession, finished: true, evaluation };
    } catch (error) {
      console.error('Interview evaluation error:', error);
      const fallbackEval = this.getMockEvaluation(interviewSession.topic);
      interviewSession.score = fallbackEval.score;
      interviewSession.feedback = fallbackEval.feedback;
      interviewSession.status = 'completed';
      await interviewSession.save();
      return { interviewSession, finished: true, evaluation: fallbackEval };
    }
  }

  getMockNextQuestion(topic, turn) {
    const questions = {
      'backend': [
        'Could you explain the difference between SQL indexing and Redis caching, and when you would use which?',
        'How would you handle asynchronous tasks like sending emails or processing images in a Node.js microservice architecture?',
        'How do database transactions (ACID properties) work, and how do you implement them in MongoDB or Postgres?'
      ],
      'frontend': [
        'How does React fiber work under the hood, and how do components schedule reconciliation?',
        'Explain how you would optimize a website suffering from layout shifts and high Largest Contentful Paint (LCP) scores.',
        'How do you manage global state across multiple complex components? Compare Redux and Zustand.'
      ]
    };
    const key = topic.toLowerCase().includes('backend') ? 'backend' : 'frontend';
    const list = questions[key] || questions['backend'];
    return list[turn - 1] || 'Could you elaborate on how you test and debug your production environments?';
  }

  getMockEvaluation(topic) {
    return {
      score: 78,
      feedback: {
        technicalCorrectness: 'Candidate demonstrated solid knowledge of core structures, though struggled with granular details of cluster scaling.',
        communication: 'Clear, concise descriptions. Could improve structured speaking formats (e.g. STAR method).',
        problemSolving: 'Structured decomposition of the prompt, suggesting robust logging and fallback pipelines.',
        keyWeakness: 'Struggled with detailing database indexing locks and query profiling analysis.',
        recommendations: [
          'Study query analyzer tool execution plans in MongoDB/Postgres.',
          'Build a small side project using Redis locks to practice synchronization concurrency.'
        ]
      }
    };
  }
}

module.exports = new InterviewAgent();
