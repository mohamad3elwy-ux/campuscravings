const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const FoodTruck = require('../models/FoodTruck');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const { io } = require('../server');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = { user: req.user.userId };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('foodTruck', 'name location')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('foodTruck', 'name location')
      .populate('items.menuItem', 'name price description')
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, [
  body('foodTruck').isMongoId().withMessage('Valid food truck ID required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.menuItem').isMongoId().withMessage('Valid menu item ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('pickupSlot.startTime').isISO8601().withMessage('Valid pickup start time required'),
  body('pickupSlot.endTime').isISO8601().withMessage('Valid pickup end time required'),
  body('specialInstructions').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { foodTruck, items, pickupSlot, specialInstructions } = req.body;

    const truck = await FoodTruck.findById(foodTruck);
    if (!truck || !truck.isActive) {
      return res.status(404).json({ message: 'Food truck not found or inactive' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem || !menuItem.isAvailable || menuItem.foodTruck.toString() !== foodTruck) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not available` });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions
      });
    }

    const order = new Order({
      user: req.user.userId,
      foodTruck,
      items: orderItems,
      totalAmount,
      pickupSlot,
      specialInstructions,
      estimatedPreparationTime: truck.currentQueueTime
    });

    await order.save();
    await order.populate('foodTruck', 'name location');
    await order.populate('items.menuItem', 'name price');

    io.to(order._id.toString()).emit('orderCreated', order);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('foodTruck')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.foodTruck.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    
    if (status === 'completed') {
      order.actualPreparationTime = Date.now() - order.createdAt;
    }

    await order.save();
    await order.populate('items.menuItem', 'name price');

    io.to(order._id.toString()).emit('orderStatusUpdate', order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/truck/:truckId', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const truck = await FoodTruck.findById(req.params.truckId);
    if (!truck) {
      return res.status(404).json({ message: 'Food truck not found' });
    }

    if (req.user.role !== 'admin' && truck.manager.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view orders for this truck' });
    }

    let query = { foodTruck: req.params.truckId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
