const express = require('express');
const router = express.Router();
const SwapRequest = require('../models/SwapRequest');
const { protect } = require('../middleware/authMiddleware');

// Create a swap request
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, offeredSkill, wantedSkill, message } = req.body;

    // Check if swap request already exists
    const existingReq = await SwapRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ],
      status: { $in: ['pending', 'accepted'] }
    });
    
    if (existingReq) {
      return res.status(400).json({ message: 'A pending or accepted connection already exists with this user' });
    }

    const swapRequest = await SwapRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      offeredSkill,
      wantedSkill,
      message
    });

    res.status(201).json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all requests for a user (incoming and outgoing)
router.get('/', protect, async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ receiver: req.user._id }).populate('sender', 'name email skillsOffered');
    const outgoing = await SwapRequest.find({ sender: req.user._id }).populate('receiver', 'name email skillsWanted');
    
    res.json({ incoming, outgoing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request status (accept/decline)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'declined'
    const swapRequest = await SwapRequest.findById(req.params.id);

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Ensure the receiver is the one updating
    if (swapRequest.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this request' });
    }

    swapRequest.status = status;
    const updatedRequest = await swapRequest.save();

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get connection status with a specific user
router.get('/status/:userId', protect, async (req, res) => {
  try {
    const swapReq = await SwapRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort({ createdAt: -1 });
    
    if (!swapReq) return res.json({ status: 'none' });
    res.json({ 
      status: swapReq.status, 
      isSender: swapReq.sender.toString() === req.user._id.toString(),
      requestId: swapReq._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel a swap request
router.delete('/:id', protect, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) return res.status(404).json({ message: 'Swap request not found' });

    // Ensure the sender is the one canceling
    if (swapRequest.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to cancel this request' });
    }

    await swapRequest.deleteOne();
    res.json({ message: 'Request canceled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
