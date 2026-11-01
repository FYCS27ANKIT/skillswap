const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skillCategory: {
      type: String,
      required: true,
      trim: true,
      default: 'Web Development',
    },
    level: {
      type: String,
      enum: ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'All Levels',
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    maxAttendees: {
      type: Number,
      default: 10,
      min: 2,
      max: 100,
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    meetingLink: {
      type: String,
      default: '',
    },
    workspaceRoomId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workshop', workshopSchema);
