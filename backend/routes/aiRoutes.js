const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');

// POST /api/ai/enhance-bio
router.post('/enhance-bio', protect, async (req, res) => {
  try {
    const { currentBio, skillsOffered, skillsWanted, tone } = req.body;
    const enhancedBio = await aiService.enhanceBio({
      currentBio: currentBio || req.user.bio,
      skillsOffered: skillsOffered || req.user.skillsOffered,
      skillsWanted: skillsWanted || req.user.skillsWanted,
      tone: tone || 'friendly',
    });
    res.json({ enhancedBio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/roadmap
router.post('/roadmap', protect, async (req, res) => {
  try {
    const { partner1Name, partner1Skill, partner2Name, partner2Skill } = req.body;
    const roadmap = await aiService.generateRoadmap({
      partner1Name: partner1Name || req.user.name,
      partner1Skill: partner1Skill || req.user.skillsOffered[0] || 'Skill A',
      partner2Name: partner2Name || 'Partner',
      partner2Skill: partner2Skill || 'Skill B',
    });
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/icebreaker
router.post('/icebreaker', protect, async (req, res) => {
  try {
    const { offeredSkill, wantedSkill, receiverName } = req.body;
    const icebreaker = await aiService.generateIcebreaker({
      senderName: req.user.name,
      offeredSkill: offeredSkill || req.user.skillsOffered[0] || 'My skill',
      wantedSkill: wantedSkill || 'Your skill',
      receiverName: receiverName || 'there',
    });
    res.json({ icebreaker });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/session-recap
router.post('/session-recap', protect, async (req, res) => {
  try {
    const { skillTopic, notes, partnerName } = req.body;
    const recap = await aiService.generateSessionRecap({
      skillTopic: skillTopic || 'Skill Swap Exchange',
      notes: notes || '',
      partnerName: partnerName || 'Swap Partner',
    });
    res.json(recap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
