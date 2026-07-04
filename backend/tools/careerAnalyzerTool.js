const { generateStructuredJSON } = require('../config/gemini');

const careerAnalyzerTool = async (profile, targetRole) => {
  const systemInstruction = `You are a Career Advisor and Senior Talent Evaluator.
Compare a user's skills and profile against a Target Role. Identify missing skills, prioritize them, and estimate a readiness percentage.
You MUST output raw JSON matching this schema exactly:
{
  "targetRole": "Role name",
  "readinessScore": 65,
  "missingSkills": [
    {
      "skill": "Name of skill",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"]
}
Ensure priorities are sorted with HIGH first, then MEDIUM, then LOW.`;

  const prompt = `Compare the following profile with the target role "${targetRole}":
  Profile:
  Skills: ${JSON.stringify(profile.skills)}
  Experience: ${profile.experience}
  Strengths: ${JSON.stringify(profile.strengths)}
  Weaknesses: ${JSON.stringify(profile.weaknesses)}
  `;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log('Gemini API Key missing. Returning mock career analysis data.');
      return getMockAnalysis(profile.skills, targetRole);
    }

    const analyzed = await generateStructuredJSON(prompt, systemInstruction);
    return analyzed;
  } catch (error) {
    console.error('Error in careerAnalyzerTool:', error);
    return getMockAnalysis(profile.skills, targetRole);
  }
};

const getMockAnalysis = (userSkills, targetRole) => {
  const normalized = targetRole.toLowerCase();
  const lowerSkills = userSkills.map(s => s.toLowerCase());
  const missingSkills = [];
  let readinessScore = 40;

  if (normalized.includes('backend')) {
    const required = [
      { skill: 'Node.js', priority: 'HIGH' },
      { skill: 'Express.js', priority: 'HIGH' },
      { skill: 'MongoDB', priority: 'HIGH' },
      { skill: 'Docker', priority: 'MEDIUM' },
      { skill: 'Redis', priority: 'MEDIUM' },
      { skill: 'System Design', priority: 'HIGH' },
      { skill: 'AWS Cloud', priority: 'LOW' }
    ];
    required.forEach(item => {
      if (!lowerSkills.includes(item.skill.toLowerCase())) {
        missingSkills.push(item);
      } else {
        readinessScore += 8;
      }
    });
  } else if (normalized.includes('frontend')) {
    const required = [
      { skill: 'React.js', priority: 'HIGH' },
      { skill: 'TypeScript', priority: 'HIGH' },
      { skill: 'State Management (Redux/Zustand)', priority: 'MEDIUM' },
      { skill: 'CSS Frameworks', priority: 'LOW' },
      { skill: 'Webpack / Vite', priority: 'MEDIUM' },
      { skill: 'Testing (Jest/Cypress)', priority: 'LOW' }
    ];
    required.forEach(item => {
      if (!lowerSkills.includes(item.skill.toLowerCase())) {
        missingSkills.push(item);
      } else {
        readinessScore += 10;
      }
    });
  } else if (normalized.includes('ai') || normalized.includes('machine')) {
    const required = [
      { skill: 'Python', priority: 'HIGH' },
      { skill: 'PyTorch / TensorFlow', priority: 'HIGH' },
      { skill: 'Data Science (Pandas/NumPy)', priority: 'HIGH' },
      { skill: 'Gemini API & LLMs', priority: 'HIGH' },
      { skill: 'Vector Databases', priority: 'MEDIUM' },
      { skill: 'MLOps', priority: 'LOW' }
    ];
    required.forEach(item => {
      if (!lowerSkills.includes(item.skill.toLowerCase())) {
        missingSkills.push(item);
      } else {
        readinessScore += 10;
      }
    });
  } else if (normalized.includes('devops')) {
    const required = [
      { skill: 'Docker', priority: 'HIGH' },
      { skill: 'Kubernetes', priority: 'HIGH' },
      { skill: 'CI/CD Pipelines (GitHub Actions)', priority: 'HIGH' },
      { skill: 'AWS / GCP', priority: 'HIGH' },
      { skill: 'Linux / Bash scripting', priority: 'MEDIUM' },
      { skill: 'Terraform (IaC)', priority: 'MEDIUM' }
    ];
    required.forEach(item => {
      if (!lowerSkills.includes(item.skill.toLowerCase())) {
        missingSkills.push(item);
      } else {
        readinessScore += 10;
      }
    });
  } else {
    // Data Scientist or default
    const required = [
      { skill: 'Python', priority: 'HIGH' },
      { skill: 'SQL', priority: 'HIGH' },
      { skill: 'Data Visualization (Tableau/Matplotlib)', priority: 'MEDIUM' },
      { skill: 'Machine Learning algorithms', priority: 'HIGH' },
      { skill: 'Statistics & Probability', priority: 'MEDIUM' }
    ];
    required.forEach(item => {
      if (!lowerSkills.includes(item.skill.toLowerCase())) {
        missingSkills.push(item);
      } else {
        readinessScore += 12;
      }
    });
  }

  readinessScore = Math.min(95, Math.max(30, readinessScore));

  return {
    targetRole,
    readinessScore,
    missingSkills,
    strengths: ['Analytical mindset', 'Eager to learn and adapt'],
    weaknesses: [`Needs structural practice in specific ${targetRole} technologies`]
  };
};

module.exports = careerAnalyzerTool;
