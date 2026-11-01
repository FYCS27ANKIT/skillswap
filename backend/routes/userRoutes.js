const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

// Helper to compute average rating and review count for an array of user objects
const attachReviewStats = async (users) => {
  const userIds = users.map(u => u._id);
  const stats = await Review.aggregate([
    { $match: { reviewee: { $in: userIds } } },
    {
      $group: {
        _id: '$reviewee',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const statsMap = new Map();
  stats.forEach(s => {
    statsMap.set(s._id.toString(), {
      averageRating: Number(s.avgRating.toFixed(1)),
      reviewCount: s.count,
    });
  });

  return users.map(u => {
    const userObj = u.toObject ? u.toObject() : u;
    const stat = statsMap.get(userObj._id.toString()) || { averageRating: 0, reviewCount: 0 };
    return {
      ...userObj,
      averageRating: stat.averageRating,
      reviewCount: stat.reviewCount,
    };
  });
};

// Get all users (for Discover page)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
    const enrichedUsers = await attachReviewStats(users);
    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile (Logged in user)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      const [enriched] = await attachReviewStats([user]);
      res.json(enriched);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.skillsOffered) user.skillsOffered = req.body.skillsOffered;
      if (req.body.skillsWanted) user.skillsWanted = req.body.skillsWanted;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      const updatedUser = await user.save();
      const [enriched] = await attachReviewStats([updatedUser]);
      res.json({
        _id: enriched._id,
        name: enriched.name,
        email: enriched.email,
        skillsOffered: enriched.skillsOffered,
        skillsWanted: enriched.skillsWanted,
        bio: enriched.bio,
        skillCredits: enriched.skillCredits ?? 3,
        averageRating: enriched.averageRating,
        reviewCount: enriched.reviewCount,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      const [enriched] = await attachReviewStats([user]);
      res.json(enriched);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
