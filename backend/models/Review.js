const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  skill: {
    type: String,
    required: true,
    trim: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null,
  },
}, { timestamps: true });

// Prevent duplicate reviews from same reviewer to same reviewee for same skill/session
reviewSchema.index({ reviewer: 1, reviewee: 1, skill: 1 }, { unique: false });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
