const express = require('express');
const { body, validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const FoodTruck = require('../models/FoodTruck');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { truckId, available = true, category } = req.query;
    let query = { isAvailable: available };
    
    if (truckId) {
      query.foodTruck = truckId;
    }
    
    if (category) {
      query.category = category;
    }
    
    const menuItems = await MenuItem.find(query)
      .populate('foodTruck', 'name location')
      .sort({ category: 1, name: 1 });
    
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('foodTruck', 'name location');
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('foodTruck').isMongoId().withMessage('Valid food truck ID required'),
  body('category').optional().isIn(['appetizer', 'main', 'dessert', 'beverage', 'snack']),
  body('description').optional().trim(),
  body('preparationTime').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const foodTruck = await FoodTruck.findById(req.body.foodTruck);
    if (!foodTruck) {
      return res.status(404).json({ message: 'Food truck not found' });
    }

    if (req.user.role !== 'admin' && foodTruck.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to add menu items to this truck' });
    }

    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    await menuItem.populate('foodTruck', 'name location');

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['appetizer', 'main', 'dessert', 'beverage', 'snack']),
  body('description').optional().trim(),
  body('preparationTime').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const menuItem = await MenuItem.findById(req.params.id).populate('foodTruck');
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (req.user.role !== 'admin' && menuItem.foodTruck.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this menu item' });
    }

    Object.assign(menuItem, req.body);
    await menuItem.save();
    await menuItem.populate('foodTruck', 'name location');

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('foodTruck');
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (req.user.role !== 'admin' && menuItem.foodTruck.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this menu item' });
    }

    await menuItem.remove();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/availability', auth, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    const menuItem = await MenuItem.findById(req.params.id).populate('foodTruck');
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    if (req.user.role !== 'admin' && menuItem.foodTruck.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this menu item' });
    }

    menuItem.isAvailable = isAvailable;
    await menuItem.save();
    await menuItem.populate('foodTruck', 'name location');

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
