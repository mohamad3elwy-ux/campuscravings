const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['Main', 'Sides', 'Drinks', 'Desserts', 'Snacks'],
    default: 'Main'
  },
  truck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck',
    required: true
  },
  image: {
    type: String,
    default: null
  },
  ingredients: [{
    type: String
  }],
  allergens: [{
    type: String
  }],
  preparationTime: {
    type: Number,
    default: 15 // minutes
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
