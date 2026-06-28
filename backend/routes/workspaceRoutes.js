const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get or create workspace content for a room
// @route   GET /api/workspace/:roomId
// @access  Private
router.get('/:roomId', protect, async (req, res) => {
  try {
    let workspace = await Workspace.findOne({ roomId: req.params.roomId });
    if (!workspace) {
      workspace = await Workspace.create({ roomId: req.params.roomId, content: '' });
    }
    res.json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching workspace' });
  }
});

// @desc    Update workspace content
// @route   PUT /api/workspace/:roomId
// @access  Private
router.put('/:roomId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    let workspace = await Workspace.findOneAndUpdate(
      { roomId: req.params.roomId },
      { content },
      { new: true, upsert: true }
    );
    res.json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error saving workspace' });
  }
});

module.exports = router;
