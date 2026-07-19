const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');
const { protect } = require('../middleware/authMiddleware');

const buildConversationId = (userId, otherUserId) => {
  const sortedIds = [userId.toString(), otherUserId.toString()].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

router.get('/connections', protect, async (req, res) => {
  try {
    const acceptedConnections = await SwapRequest.find({
      status: 'accepted',
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id },
      ],
    }).populate('sender', 'name email').populate('receiver', 'name email');

    const conversations = acceptedConnections.map((connection) => {
      const otherUser = connection.sender._id.toString() === req.user._id.toString()
        ? connection.receiver
        : connection.sender;

      return {
        _id: connection._id,
        otherUser,
        conversationId: buildConversationId(req.user._id, otherUser._id),
      };
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, text, conversationId } = req.body;

    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }

    const preparedConversationId = conversationId || buildConversationId(req.user._id, receiverId);

    const message = await Message.create({
      conversationId: preparedConversationId,
      sender: req.user._id,
      receiver: receiverId,
      text: text.trim(),
    });

    await message.populate([
      { path: 'sender', select: 'name email' },
      { path: 'receiver', select: 'name email' },
    ]);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
