const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// POST /api/reviews - Submit a review
router.post('/', protect, async (req, res) => {
  try {
    const { revieweeId, rating, comment, skill, sessionId } = req.body;

    if (!revieweeId || !rating || !comment || !skill) {
      return res.status(400).json({ message: 'Reviewee, rating, comment, and skill are required' });
    }

    if (revieweeId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const revieweeUser = await User.findById(revieweeId);
    if (!revieweeUser) {
      return res.status(404).json({ message: 'Reviewee user not found' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: numericRating,
      skill: skill.trim(),
      comment: comment.trim(),
      session: sessionId || null,
    });

    await review.populate('reviewer', 'name email');

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/user/:userId - Get reviews and stats for a specific user
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    let averageRating = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (reviewCount > 0) {
      const sum = reviews.reduce((acc, curr) => {
        const rounded = Math.round(curr.rating);
        if (distribution[rounded] !== undefined) {
          distribution[rounded] += 1;
        }
        return acc + curr.rating;
      }, 0);
      averageRating = Number((sum / reviewCount).toFixed(1));
    }

    res.json({
      reviews,
      reviewCount,
      averageRating,
      distribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/my - Get reviews received by the authenticated user
router.get('/my', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.user._id })
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
