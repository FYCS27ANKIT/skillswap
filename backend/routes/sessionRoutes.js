const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const SwapRequest = require('../models/SwapRequest');
const { protect } = require('../middleware/authMiddleware');

// GET /api/sessions - Get all sessions for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { creator: req.user._id },
        { partner: req.user._id },
      ],
    })
      .populate('creator', 'name email skillsOffered')
      .populate('partner', 'name email skillsOffered')
      .sort({ scheduledAt: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/sessions - Schedule a new session
router.post('/', protect, async (req, res) => {
  try {
    const { partnerId, title, skillTopic, scheduledAt, duration, notes, swapRequestId } = req.body;

    if (!partnerId || !title || !scheduledAt) {
      return res.status(400).json({ message: 'Partner, title, and scheduled date/time are required' });
    }

    const session = new Session({
      creator: req.user._id,
      partner: partnerId,
      swapRequest: swapRequestId || null,
      title: title.trim(),
      skillTopic: (skillTopic || 'General Skill Swap').trim(),
      scheduledAt: new Date(scheduledAt),
      duration: Number(duration) || 60,
      notes: (notes || '').trim(),
      status: 'scheduled',
    });

    // Generate unique Jitsi room link for quick 1-click video calling
    session.meetingLink = `https://meet.jit.si/skillswap-${session._id.toString()}`;
    await session.save();

    await session.populate([
      { path: 'creator', select: 'name email skillsOffered' },
      { path: 'partner', select: 'name email skillsOffered' },
    ]);

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/sessions/:id - Update session status or details
router.put('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Must be a participant
    const isParticipant =
      session.creator.toString() === req.user._id.toString() ||
      session.partner.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to modify this session' });
    }

    if (req.body.status) session.status = req.body.status;
    if (req.body.title) session.title = req.body.title.trim();
    if (req.body.skillTopic) session.skillTopic = req.body.skillTopic.trim();
    if (req.body.scheduledAt) session.scheduledAt = new Date(req.body.scheduledAt);
    if (req.body.duration) session.duration = Number(req.body.duration);
    if (req.body.notes !== undefined) session.notes = req.body.notes.trim();

    await session.save();
    await session.populate([
      { path: 'creator', select: 'name email skillsOffered' },
      { path: 'partner', select: 'name email skillsOffered' },
    ]);

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/sessions/:id - Cancel/remove session
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isParticipant =
      session.creator.toString() === req.user._id.toString() ||
      session.partner.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to cancel this session' });
    }

    await session.deleteOne();
    res.json({ message: 'Session cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
