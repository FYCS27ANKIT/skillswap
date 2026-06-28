const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/authMiddleware');

router.post('/syllabus', protect, async (req, res) => {
  try {
    const { offeredSkill, wantedSkill, otherUserName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is missing from .env' });
    }

    // MOCK MODE: If key starts with AQ., it's a token not an API key. 
    // We'll return a mock response so you can see the feature working while you get a real key!
    if (apiKey.startsWith('AQ.')) {
        console.log("⚠️ Access Token detected (AQ.). Entering MOCK AI mode...");
        const mockSyllabus = `## 4-Week Learning Path: ${offeredSkill} & ${wantedSkill}\n\n` +
            `### Week 1: Introduction & Fundamentals\n- Understanding the basics of ${offeredSkill}\n- Setting up your development environment\n\n` +
            `### Week 2: Intermediate Concepts\n- Deep dive into ${wantedSkill} architecture\n- Practical exercises and small projects\n\n` +
            `### Week 3: Project Integration\n- Combining both skills into a singular workflow\n- Peer-to-peer code review and feedback\n\n` +
            `### Week 4: Finalization & Polish\n- Completing the cross-teaching project\n- Discussion on advanced topics and next steps.`;
        
        return res.json({ syllabus: mockSyllabus });
    }

    console.log("API Key Prefix:", apiKey.substring(0, 4));

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let syllabusText = "";
    
    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting AI with ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const prompt = `Create a 4-week learning path/syllabus for a skill swap exchange. 
            User A (me) is teaching "${offeredSkill}" to ${otherUserName}.
            User B (${otherUserName}) is teaching "${wantedSkill}" to me.
            
            Provide a structured 4-week plan with weekly goals and a few bullet points for each week.
            Format the response in clean Markdown. Keep it concise but helpful.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            syllabusText = response.text();
            
            if (syllabusText) {
                console.log(`Success with ${modelName}!`);
                break;
            }
        } catch (err) {
            console.error(`Model ${modelName} failed:`, err.status === 404 ? "404 Not Found" : err.message);
            if (err.status !== 404) break; // If it's 401 or other, don't keep trying models
        }
    }

    if (!syllabusText) {
        throw new Error("Could not find any available models with this API key.");
    }

    res.json({ syllabus: syllabusText });
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ message: 'Failed to generate syllabus with AI.' });
  }
});

// @desc    Generate a user bio using AI
// @route   POST /api/ai/generate-bio
// @access  Private
router.post('/generate-bio', protect, async (req, res) => {
  try {
    const { skillsOffered, skillsWanted, name } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is missing from .env' });
    }

    // MOCK MODE
    if (apiKey.startsWith('AQ.')) {
        console.log("⚠️ Access Token detected (AQ.). Entering MOCK AI Bio mode...");
        const mockBio = `Hi, I'm ${name}! I'm passionate about sharing my knowledge in ${skillsOffered.join(', ')} and I'm currently looking to expand my horizons by learning ${skillsWanted.join(', ')}. I believe in the power of skill swapping and I'm excited to connect with fellow learners!`;
        return res.json({ bio: mockBio });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let bioText = "";
    
    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = `Write a professional and friendly bio (around 2-3 sentences) for a skill-swap platform. 
            The user's name is ${name}. 
            They are offering to teach: ${skillsOffered.join(', ')}. 
            They are looking to learn: ${skillsWanted.join(', ')}. 
            Make it sound engaging and collaborative. Use first person ("I").`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            bioText = response.text();
            
            if (bioText) break;
        } catch (err) {
            if (err.status !== 404) break;
        }
    }

    if (!bioText) {
        throw new Error("Could not find any available models with this API key.");
    }

    res.json({ bio: bioText });
  } catch (error) {
    console.error('Gemini Bio Error:', error);
    res.status(500).json({ message: 'Failed to generate bio with AI.' });
  }
});

module.exports = router;
