const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  city: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown',
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  os: {
    type: String,
    default: 'Unknown',
  },
  referrer: {
    type: String,
    default: 'Direct',
  },
  userAgent: {
    type: String,
    default: '',
  },
});

// Indexes for analytics queries
clickSchema.index({ shortCode: 1 });
clickSchema.index({ urlId: 1 });
clickSchema.index({ timestamp: -1 });
clickSchema.index({ shortCode: 1, timestamp: -1 });

module.exports = mongoose.model('Click', clickSchema);
