const { generateStructuredJSON } = require('../config/gemini');

const jobSearchTool = async (skills, targetRole) => {
  const systemInstruction = `You are a specialized Tech Recruiter Bot.
Review a candidate's skills list against active job market vacancies for the target role.
Generate 3 realistic matching jobs. For each job, return a match compatibility percentage and missing skills.
You MUST output raw JSON matching this schema exactly:
{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location or Remote",
      "matchScore": 85,
      "missingSkills": ["AWS", "Kubernetes"],
      "salaryRange": "$80,000 - $100,000",
      "description": "Short summary of responsibilities"
    }
  ]
}`;

  const prompt = `Match this user to jobs:
  Target Role: ${targetRole}
  User Skills: ${JSON.stringify(skills)}`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('Gemini API Key missing. Returning mock matching jobs.');
      return getMockJobs(skills, targetRole);
    }

    const matchedJobs = await generateStructuredJSON(prompt, systemInstruction);
    return matchedJobs;
  } catch (error) {
    console.error('Error in jobSearchTool:', error);
    return getMockJobs(skills, targetRole);
  }
};

const getMockJobs = (userSkills, targetRole) => {
  const lowercaseSkills = userSkills.map(s => s.toLowerCase());
  
  // Custom mock database of job roles
  const mockVacancies = [
    {
      title: `Junior ${targetRole}`,
      company: 'AppScale Technologies',
      location: 'Remote (US/Canada)',
      required: ['javascript', 'sql', 'git'],
      salaryRange: '$60,000 - $80,000',
      description: 'Join a high-growth startup working on automated developer workflows.'
    },
    {
      title: `${targetRole} - Associate`,
      company: 'Quantum Finance Systems',
      location: 'Hybrid (New York, NY)',
      required: ['docker', 'mongodb', 'system design'],
      salaryRange: '$90,000 - $115,000',
      description: 'Maintain and scale core transaction engines serving institutional traders.'
    },
    {
      title: `Software Engineer (${targetRole} Team)`,
      company: 'MegaCloud Services',
      location: 'San Francisco, CA',
      required: ['aws', 'kubernetes', 'node.js', 'python'],
      salaryRange: '$120,000 - $150,000',
      description: 'Pioneering cloud computing systems with robust automated scale policies.'
    }
  ];

  const matched = mockVacancies.map(vacancy => {
    const missing = [];
    let hits = 0;
    
    vacancy.required.forEach(req => {
      const isMatched = lowercaseSkills.some(skill => skill.includes(req) || req.includes(skill));
      if (isMatched) {
        hits++;
      } else {
        // Find human readable missing skill representation
        const capitalized = req.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        missing.push(capitalized);
      }
    });

    const baseScore = 50;
    const matchScore = Math.min(98, Math.round(baseScore + (hits / vacancy.required.length) * 45));

    return {
      title: vacancy.title,
      company: vacancy.company,
      location: vacancy.location,
      matchScore,
      missingSkills: missing.length > 0 ? missing : ['None (Fully Aligned)'],
      salaryRange: vacancy.salaryRange,
      description: vacancy.description
    };
  });

  return { jobs: matched };
};

module.exports = jobSearchTool;
