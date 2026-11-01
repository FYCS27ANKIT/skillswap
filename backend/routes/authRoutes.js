const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, skillsOffered, skillsWanted, bio } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name,
      email,
      password,
      skillsOffered,
      skillsWanted,
      bio,
      skillCredits: 3, // Welcome grant
    });

    if (user) {
      // Record welcome signup bonus transaction
      try {
        await CreditTransaction.create({
          sender: null,
          receiver: user._id,
          amount: 3,
          type: 'signup_bonus',
          notes: 'Welcome bonus: 3 free skill credits to kickstart learning',
        });
      } catch (txErr) {
        console.warn('Could not record signup bonus transaction:', txErr.message);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        bio: user.bio,
        skillCredits: user.skillCredits,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Ensure existing users have default credits if missing
      if (user.skillCredits === undefined || user.skillCredits === null) {
        user.skillCredits = 3;
        await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        bio: user.bio,
        skillCredits: user.skillCredits,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
