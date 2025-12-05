const mongoose = require('mongoose');

const foodTruckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    open: {
      type: String,
      default: '08:00'
    },
    close: {
      type: String,
      default: '20:00'
    }
  },
  currentQueueTime: {
    type: Number,
    default: 15
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FoodTruck', foodTruckSchema);
