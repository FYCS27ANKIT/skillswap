const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get conversation with a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all connected users (accepted swap requests)
router.get('/conversations/list', protect, async (req, res) => {
  try {
    const SwapRequest = require('../models/SwapRequest');
    const connections = await SwapRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: 'accepted'
    });

    const userIds = new Set();
    connections.forEach(conn => {
      if (conn.sender.toString() !== req.user._id.toString()) userIds.add(conn.sender.toString());
      if (conn.receiver.toString() !== req.user._id.toString()) userIds.add(conn.receiver.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/', protect, async (req, res) => {
  try {
    const SwapRequest = require('../models/SwapRequest');
    const { receiverId, content } = req.body;
    
    const isConnected = await SwapRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ],
      status: 'accepted'
    });

    if (!isConnected) {
      return res.status(403).json({ message: 'You can only message connected users.'});
    }
    
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
