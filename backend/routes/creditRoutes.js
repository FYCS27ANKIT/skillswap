const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const { protect } = require('../middleware/authMiddleware');

// GET /api/credits/balance - Get current user credit balance and transaction history
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('skillCredits name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Default to 3 credits if not set
    if (user.skillCredits === undefined || user.skillCredits === null) {
      user.skillCredits = 3;
      await user.save();
    }

    const transactions = await CreditTransaction.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      skillCredits: user.skillCredits,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/credits/transfer - Transfer skill credits to another swapper
router.post('/transfer', protect, async (req, res) => {
  try {
    const { recipientId, amount = 1, sessionId, notes } = req.body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return res.status(400).json({ message: 'Transfer amount must be at least 1 credit' });
    }

    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot transfer credits to yourself' });
    }

    const sender = await User.findById(req.user._id);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient swapper not found' });
    }

    const senderCredits = sender.skillCredits ?? 3;
    if (senderCredits < numAmount) {
      return res.status(400).json({
        message: `Insufficient skill credits. You have ${senderCredits} credit(s), but ${numAmount} is required.`,
      });
    }

    sender.skillCredits = senderCredits - numAmount;
    recipient.skillCredits = (recipient.skillCredits ?? 3) + numAmount;

    await sender.save();
    await recipient.save();

    const transaction = await CreditTransaction.create({
      sender: sender._id,
      receiver: recipient._id,
      amount: numAmount,
      type: sessionId ? 'session_payment' : 'direct_transfer',
      session: sessionId || null,
      notes: notes || (sessionId ? 'Session barter credit payment' : 'Skill credit transfer'),
    });

    await transaction.populate([
      { path: 'sender', select: 'name email' },
      { path: 'receiver', select: 'name email' },
    ]);

    res.status(201).json({
      message: `Successfully transferred ${numAmount} credit(s) to ${recipient.name}`,
      newBalance: sender.skillCredits,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
