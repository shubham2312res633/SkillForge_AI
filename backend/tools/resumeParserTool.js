const { generateStructuredJSON } = require('../config/gemini');

const resumeParserTool = async (rawText) => {
  const systemInstruction = `You are an expert ATS (Applicant Tracking System) parser and professional recruiter.
Extract structured information from the provided resume text.
You MUST output raw JSON matching this schema exactly:
{
  "name": "Full Name",
  "skills": ["Skill 1", "Skill 2"],
  "projects": [
    {
      "title": "Project Title",
      "description": "Short description of what the project does and technologies used"
    }
  ],
  "experience": "Brief summary of work experience, years, and major titles",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Area of improvement 1", "Area of improvement 2"],
  "resume_score": 75
}
Ensure the resume_score is an integer between 0 and 100 based on standard industry guidelines.`;

  const prompt = `Parse the following raw resume text and return structured JSON output:
  ---
  ${rawText}
  ---`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('Gemini API Key missing. Returning mock parsed resume data.');
      return getMockData(rawText);
    }
    
    const parsed = await generateStructuredJSON(prompt, systemInstruction);
    return parsed;
  } catch (error) {
    console.error('Error in resumeParserTool:', error);
    return getMockData(rawText);
  }
};

const getMockData = (text) => {
  // Simple heuristic parsing for mock fallback
  const lowercase = text.toLowerCase();
  const name = text.split('\n')[0]?.trim() || 'Alex Mercer';
  const skills = [];
  
  if (lowercase.includes('javascript') || lowercase.includes('js')) skills.push('JavaScript');
  if (lowercase.includes('react')) skills.push('React.js');
  if (lowercase.includes('node')) skills.push('Node.js');
  if (lowercase.includes('python')) skills.push('Python');
  if (lowercase.includes('sql') || lowercase.includes('database')) skills.push('SQL');
  if (lowercase.includes('docker')) skills.push('Docker');
  
  if (skills.length === 0) {
    skills.push('JavaScript', 'HTML/CSS', 'Git', 'SQL');
  }

  return {
    name,
    skills,
    projects: [
      {
        title: 'E-Commerce Microservices',
        description: 'Built a scalable e-commerce backend using Node.js, Express, and MongoDB. Integrated Redis for session caching.'
      },
      {
        title: 'Task Manager App',
        description: 'Developed a responsive frontend using React and Tailwind CSS, featuring user auth and drag-and-drop task boards.'
      }
    ],
    experience: lowercase.includes('junior') ? '1 year of experience as a Junior Developer' : '2 years of experience in Full-Stack development roles',
    strengths: ['Solid foundation in core languages', 'Great project experience with modern JS libraries'],
    weaknesses: ['Needs exposure to cloud deployments (AWS/GCP)', 'Missing production system design concepts'],
    resume_score: Math.min(85, 60 + skills.length * 4)
  };
};

module.exports = resumeParserTool;
