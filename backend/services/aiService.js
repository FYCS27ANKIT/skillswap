const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIzaSy')) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.warn('Gemini AI initialization note:', err.message);
  }
}

// Fallback generators when API key is not configured or rate-limited
const fallbackEnhanceBio = ({ currentBio, skillsOffered = [], skillsWanted = [], tone = 'friendly' }) => {
  const offered = skillsOffered.join(', ') || 'various disciplines';
  const wanted = skillsWanted.join(', ') || 'new horizons';
  
  if (tone === 'professional') {
    return `Passionate specialist with proven expertise in ${offered}. Committed to continuous professional development, currently expanding competencies into ${wanted}. Always eager to exchange practical domain knowledge through collaborative peer learning.`;
  } else if (tone === 'mentor') {
    return `Dedicated mentor and lifelong learner! I love breaking down complex concepts in ${offered} into actionable, intuitive steps. In exchange, I am actively seeking swappers to guide me through ${wanted}. Let's learn and build together!`;
  } else {
    // casual / friendly
    return `Hey there! I enjoy sharing what I know about ${offered} and swapping real-world tips. Currently super excited to dive into ${wanted}. Let's connect, exchange skills, and level up together!`;
  }
};

const fallbackGenerateRoadmap = ({ partner1Name = 'You', partner1Skill = 'Skill 1', partner2Name = 'Partner', partner2Skill = 'Skill 2' }) => {
  return {
    overview: `Collaborative 4-Session Skill Swap Roadmap between ${partner1Name} (${partner1Skill}) and ${partner2Name} (${partner2Skill})`,
    sessions: [
      {
        sessionNumber: 1,
        title: "Foundations & Goal Setting",
        description: `Introduction to core terminology, setup, and reciprocal expectations.`,
        partA: `${partner1Name} introduces core principles of ${partner1Skill} and essential tooling.`,
        partB: `${partner2Name} covers key fundamentals and mental models for ${partner2Skill}.`,
        suggestedDuration: "60 mins"
      },
      {
        sessionNumber: 2,
        title: "Hands-on Practice & Core Patterns",
        description: "Moving from theory to practical exercises and common workflows.",
        partA: `${partner1Name} walks through intermediate patterns and best practices in ${partner1Skill}.`,
        partB: `${partner2Name} demonstrates practical real-world exercises in ${partner2Skill}.`,
        suggestedDuration: "60 mins"
      },
      {
        sessionNumber: 3,
        title: "Deep Dive & Problem Solving",
        description: "Troubleshooting edge cases, advanced tips, and workflow acceleration.",
        partA: `${partner1Name} reviews debugging, optimization, and expert nuances in ${partner1Skill}.`,
        partB: `${partner2Name} shares pro tips, common pitfalls, and architectural insights for ${partner2Skill}.`,
        suggestedDuration: "60 mins"
      },
      {
        sessionNumber: 4,
        title: "Capstone Exchange & Knowledge Review",
        description: "Reviewing progress, presenting a mini-project, and feedback exchange.",
        partA: `${partner2Name} presents a mini exercise created with ${partner1Skill} for review.`,
        partB: `${partner1Name} demonstrates application of newly learned ${partner2Skill}.`,
        suggestedDuration: "60 mins"
      }
    ],
    tips: [
      "Dedicate 30 minutes to teaching and 30 minutes to learning in each session.",
      "Keep a shared notes document or repository for code/exercise snippets.",
      "Schedule consistent weekly times to maintain momentum."
    ]
  };
};

const fallbackGenerateIcebreaker = ({ senderName = 'A swapper', offeredSkill, wantedSkill, receiverName = 'there' }) => {
  return `Hi ${receiverName}! I saw your profile and love that you're experienced with ${wantedSkill}. I'd love to share my knowledge in ${offeredSkill} in exchange for some guidance on ${wantedSkill}. Let's connect and schedule a session!`;
};

// AI Enhancement Service functions
const enhanceBio = async ({ currentBio, skillsOffered, skillsWanted, tone = 'friendly' }) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert bio writer for SkillSwap, a peer-to-peer knowledge exchange platform.
Write a punchy, warm, 2-3 sentence profile bio (under 50 words) for a user with:
- Skills they offer/teach: ${skillsOffered.join(', ')}
- Skills they want to learn: ${skillsWanted.join(', ')}
- Current bio / notes: "${currentBio || 'Passionate learner'}"
- Desired tone: ${tone} (e.g. professional, friendly, or mentor).

Return ONLY the plain text bio without quotes or markdown headers.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent fallback:', err.message);
    }
  }
  return fallbackEnhanceBio({ currentBio, skillsOffered, skillsWanted, tone });
};

const generateRoadmap = async ({ partner1Name, partner1Skill, partner2Name, partner2Skill }) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Create a structured 4-session collaborative skill swap syllabus between two learners:
Learner 1: ${partner1Name} (teaches: ${partner1Skill})
Learner 2: ${partner2Name} (teaches: ${partner2Skill})

Return a JSON object in this exact schema:
{
  "overview": "Short summary string",
  "sessions": [
    {
      "sessionNumber": 1,
      "title": "Title",
      "description": "Brief description",
      "partA": "What ${partner1Name} teaches in ${partner1Skill}",
      "partB": "What ${partner2Name} teaches in ${partner2Skill}",
      "suggestedDuration": "60 mins"
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}
Return ONLY valid JSON with no markdown wrapping.`;
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }
      return JSON.parse(text);
    } catch (err) {
      console.warn('Gemini roadmap call failed, using intelligent fallback:', err.message);
    }
  }
  return fallbackGenerateRoadmap({ partner1Name, partner1Skill, partner2Name, partner2Skill });
};

const generateIcebreaker = async ({ senderName, offeredSkill, wantedSkill, receiverName }) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Write a polite, engaging 2-sentence swap proposal message from ${senderName} to ${receiverName}.
${senderName} wants to teach ${offeredSkill} in exchange for learning ${wantedSkill}.
Keep it concise, friendly, and collaborative. Return ONLY the message.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch (err) {
      console.warn('Gemini icebreaker call failed, using fallback:', err.message);
    }
  }
  return fallbackGenerateIcebreaker({ senderName, offeredSkill, wantedSkill, receiverName });
};

const fallbackGenerateSessionRecap = ({ skillTopic = 'Skill Topic', notes = '', partnerName = 'Partner' }) => {
  return {
    topic: skillTopic,
    summary: [
      `Reviewed core concepts, mental models, and best practices in ${skillTopic}.`,
      `Hands-on walkthrough of real-world scenarios and common developer/creator patterns.`,
      `Discussed debugging techniques, optimization tips, and troubleshooting common stumbling blocks.`,
    ],
    homework: [
      `Build a mini-exercise or project incorporating the concepts learned in this ${skillTopic} session.`,
      `Write out 2 questions or edge cases encountered during self-practice to discuss in your next swap.`,
      `Review key documentation or cheat-sheets for 20 minutes to solidify terminology and syntax.`,
    ],
    resources: [
      { title: `Official ${skillTopic} Documentation`, link: `https://www.google.com/search?q=${encodeURIComponent(skillTopic + ' documentation cheat sheet')}` },
      { title: `Interactive Practice & Exercises`, link: `https://www.google.com/search?q=${encodeURIComponent(skillTopic + ' interactive tutorial exercises')}` },
    ],
  };
};

const generateSessionRecap = async ({ skillTopic, notes, partnerName }) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert learning coach for SkillSwap.
A live 1-on-1 skill barter session just concluded on topic: "${skillTopic}".
Session notes: "${notes || 'Covered foundations and practice'}".
Teacher/Partner: "${partnerName}".

Return a valid JSON object summarizing the session with actionable practice:
{
  "topic": "${skillTopic}",
  "summary": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "homework": ["Task 1", "Task 2", "Task 3"],
  "resources": [
    { "title": "Resource title", "link": "https://..." }
  ]
}
Return ONLY valid JSON without markdown formatting.`;
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }
      return JSON.parse(text);
    } catch (err) {
      console.warn('Gemini session recap call failed, using fallback:', err.message);
    }
  }
  return fallbackGenerateSessionRecap({ skillTopic, notes, partnerName });
};

module.exports = {
  enhanceBio,
  generateRoadmap,
  generateIcebreaker,
  generateSessionRecap,
};
