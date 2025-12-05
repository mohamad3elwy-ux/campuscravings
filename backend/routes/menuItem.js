const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Truck = require('../models/Truck');
const { auth, isTruckOwner, isCustomer } = require('../middleware/auth');

// POST /api/v1/menuItem/new - Create menu item (Truck Owner)
router.post('/new', auth, isTruckOwner, async (req, res) => {
  try {
    const { name, description, price, category, truckId, ingredients, allergens, preparationTime } = req.body;

    // Verify truck ownership
    const truck = await Truck.findOne({ _id: truckId, owner: req.user._id });
    if (!truck) {
      return res.status(403).json({ error: 'You do not own this truck' });
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      truck: truckId,
      ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [],
      allergens: allergens ? allergens.split(',').map(a => a.trim()) : [],
      preparationTime: preparationTime || 15
    });

    await menuItem.save();
    res.status(201).json({ message: 'Menu item created', menuItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/menuItem/view - View my menu items (Truck Owner)
router.get('/view', auth, isTruckOwner, async (req, res) => {
  try {
    const trucks = await Truck.find({ owner: req.user._id });
    const truckIds = trucks.map(t => t._id);
    const menuItems = await MenuItem.find({ truck: { $in: truckIds } }).populate('truck', 'name');
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/menuItem/view/:itemId - View specific menu item (Truck Owner)
router.get('/view/:itemId', auth, isTruckOwner, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId).populate('truck', 'name owner');
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Verify ownership
    if (menuItem.truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/menuItem/edit/:itemId - Edit menu item (Truck Owner)
router.put('/edit/:itemId', auth, isTruckOwner, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId).populate('truck', 'owner');
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Verify ownership
    if (menuItem.truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = req.body;
    if (updates.ingredients && typeof updates.ingredients === 'string') {
      updates.ingredients = updates.ingredients.split(',').map(i => i.trim());
    }
    if (updates.allergens && typeof updates.allergens === 'string') {
      updates.allergens = updates.allergens.split(',').map(a => a.trim());
    }

    Object.assign(menuItem, updates);
    await menuItem.save();

    res.json({ message: 'Menu item updated', menuItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/menuItem/delete/:itemId - Delete menu item (Truck Owner)
router.delete('/delete/:itemId', auth, isTruckOwner, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.itemId).populate('truck', 'owner');
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Verify ownership
    if (menuItem.truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await MenuItem.findByIdAndDelete(req.params.itemId);
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/menuItem/truck/:truckId - View truck's menu (Customer)
router.get('/truck/:truckId', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ 
      truck: req.params.truckId,
      isAvailable: true 
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/menuItem/truck/:truckId/category/:category - Search menu by category (Customer)
router.get('/truck/:truckId/category/:category', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ 
      truck: req.params.truckId,
      category: req.params.category,
      isAvailable: true 
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
