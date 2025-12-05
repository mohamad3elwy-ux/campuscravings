const express = require('express');
const { body, validationResult } = require('express-validator');
const FoodTruck = require('../models/FoodTruck');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { active = true } = req.query;
    const trucks = await FoodTruck.find({ isActive: active })
      .populate('manager', 'name email')
      .sort({ name: 1 });
    
    res.json(trucks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const truck = await FoodTruck.findById(req.params.id)
      .populate('manager', 'name email');
    
    if (!truck) {
      return res.status(404).json({ message: 'Food truck not found' });
    }
    
    res.json(truck);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location required'),
  body('description').optional().trim(),
  body('operatingHours.open').optional().isTime(),
  body('operatingHours.close').optional().isTime()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'truck_manager') {
      return res.status(403).json({ message: 'Not authorized to create food trucks' });
    }

    const truckData = {
      ...req.body,
      manager: req.user.userId
    };

    const truck = new FoodTruck(truckData);
    await truck.save();
    await truck.populate('manager', 'name email');

    res.status(201).json(truck);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('location').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim(),
  body('operatingHours.open').optional().isTime(),
  body('operatingHours.close').optional().isTime()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const truck = await FoodTruck.findById(req.params.id);
    if (!truck) {
      return res.status(404).json({ message: 'Food truck not found' });
    }

    if (req.user.role !== 'admin' && truck.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this food truck' });
    }

    Object.assign(truck, req.body);
    await truck.save();
    await truck.populate('manager', 'name email');

    res.json(truck);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const truck = await FoodTruck.findById(req.params.id);
    if (!truck) {
      return res.status(404).json({ message: 'Food truck not found' });
    }

    if (req.user.role !== 'admin' && truck.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this food truck' });
    }

    await truck.remove();
    res.json({ message: 'Food truck deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id/menu', async (req, res) => {
  try {
    const { available = true } = req.query;
    const menuItems = await MenuItem.find({ 
      foodTruck: req.params.id,
      isAvailable: available
    }).sort({ category: 1, name: 1 });
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
