const express = require('express');
const router = express.Router();
const Workshop = require('../models/Workshop');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const autoSeedWorkshopsIfEmpty = async () => {
  const count = await Workshop.countDocuments();
  if (count > 0) return;

  const users = await User.find().limit(5);
  if (!users || users.length === 0) return;

  const now = new Date();
  const sampleData = [
    {
      host: users[0]._id,
      title: 'Fullstack System Design: Scaling to 10 Million Users',
      description: 'Interactive deep dive into distributed caching (Redis), database sharding, message queues, and load balancing patterns. Bring your questions and architecture diagrams!',
      skillCategory: 'System Design',
      level: 'Intermediate',
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
      duration: 75,
      maxAttendees: 15,
      tags: ['System Design', 'Redis', 'Microservices', 'Distributed Systems'],
      attendees: users.length > 2 ? [{ user: users[1]._id }, { user: users[2]._id }] : [],
    },
    {
      host: users.length > 1 ? users[1]._id : users[0]._id,
      title: 'Building Production Agentic AI with Gemini & LangChain',
      description: 'Hands-on live coding cohort. We will construct multi-tool autonomous AI agents, ground knowledge retrieval with embeddings, and deploy resilient fallback prompts.',
      skillCategory: 'AI & Machine Learning',
      level: 'Advanced',
      scheduledAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 days
      duration: 90,
      maxAttendees: 12,
      tags: ['Gemini API', 'Agents', 'Python', 'Embeddings'],
      attendees: users.length > 3 ? [{ user: users[0]._id }, { user: users[2]._id }] : [],
    },
    {
      host: users.length > 2 ? users[2]._id : users[0]._id,
      title: 'React 19 Concurrent Features & Performance Masterclass',
      description: 'Explore useActionState, useOptimistic, server actions, and fine-grained memoization strategies without bloated dependencies.',
      skillCategory: 'Web Development',
      level: 'Intermediate',
      scheduledAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // +6 days
      duration: 60,
      maxAttendees: 10,
      tags: ['React 19', 'JavaScript', 'Web Development', 'Frontend'],
      attendees: users.length > 1 ? [{ user: users[0]._id }] : [],
    },
  ];

  for (const item of sampleData) {
    const ws = new Workshop(item);
    ws.meetingLink = `https://meet.jit.si/skillswap-circle-${ws._id.toString()}`;
    ws.workspaceRoomId = `circle-${ws._id.toString()}`;
    await ws.save();
  }
};

// GET /api/workshops - Fetch all community workshops with optional search and filters
router.get('/', async (req, res) => {
  try {
    await autoSeedWorkshopsIfEmpty();
    const { category, search, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      // Default to upcoming workshops or in-progress
      filter.status = { $in: ['upcoming', 'in-progress'] };
    }

    if (category && category !== 'All') {
      filter.skillCategory = category;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skillCategory: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const workshops = await Workshop.find(filter)
      .populate('host', 'name email avatar headline')
      .populate('attendees.user', 'name email avatar')
      .sort({ scheduledAt: 1 });

    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/workshops/:id - Get a single workshop by ID
router.get('/:id', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate('host', 'name email avatar headline')
      .populate('attendees.user', 'name email avatar');

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop circle not found' });
    }

    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/workshops - Host creates a new workshop
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      skillCategory,
      level,
      scheduledAt,
      duration,
      maxAttendees,
      tags,
    } = req.body;

    if (!title || !description || !scheduledAt) {
      return res.status(400).json({ message: 'Title, description, and scheduled date/time are required' });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduled date/time format' });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const workshop = new Workshop({
      host: req.user._id,
      title: title.trim(),
      description: description.trim(),
      skillCategory: skillCategory || 'Web Development',
      level: level || 'All Levels',
      scheduledAt: scheduledDate,
      duration: Number(duration) || 60,
      maxAttendees: Math.min(Math.max(Number(maxAttendees) || 10, 2), 100),
      tags: parsedTags,
      attendees: [],
    });

    workshop.meetingLink = `https://meet.jit.si/skillswap-circle-${workshop._id.toString()}`;
    workshop.workspaceRoomId = `circle-${workshop._id.toString()}`;

    await workshop.save();

    await workshop.populate('host', 'name email avatar headline');

    res.status(201).json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/workshops/:id/rsvp - Toggle RSVP (reserve seat or cancel reservation)
router.post('/:id/rsvp', protect, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop circle not found' });
    }

    if (workshop.host.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You are the host of this workshop circle' });
    }

    const userIdStr = req.user._id.toString();
    const existingIndex = workshop.attendees.findIndex(
      (a) => (a.user?._id || a.user).toString() === userIdStr
    );

    let isRegistered = false;

    if (existingIndex > -1) {
      // Cancel RSVP
      workshop.attendees.splice(existingIndex, 1);
      isRegistered = false;
    } else {
      // Check capacity
      if (workshop.attendees.length >= workshop.maxAttendees) {
        return res.status(400).json({
          message: `This workshop is fully booked (${workshop.maxAttendees}/${workshop.maxAttendees} seats filled)`,
        });
      }

      workshop.attendees.push({
        user: req.user._id,
        registeredAt: new Date(),
      });
      isRegistered = true;
    }

    await workshop.save();

    await workshop.populate([
      { path: 'host', select: 'name email avatar headline' },
      { path: 'attendees.user', select: 'name email avatar' },
    ]);

    res.json({
      message: isRegistered ? 'Seat successfully reserved!' : 'RSVP successfully cancelled',
      isRegistered,
      workshop,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/workshops/:id/status - Update workshop status (Host only)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop circle not found' });
    }

    if (workshop.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the workshop host can update status' });
    }

    workshop.status = status;
    await workshop.save();

    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/workshops/:id - Cancel/Delete workshop (Host only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop circle not found' });
    }

    if (workshop.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the workshop host can cancel this workshop' });
    }

    await Workshop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workshop circle successfully cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
