const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Truck = require('../models/Truck');
const { auth, isTruckOwner } = require('../middleware/auth');

// POST /api/v1/order/new - Place order (Customer)
router.post('/new', auth, async (req, res) => {
  try {
    const { cartId, pickupSlot } = req.body;

    // Get cart
    const cart = await Cart.findOne({ _id: cartId, user: req.user._id })
      .populate('items.menuItem')
      .populate('truck');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Calculate total
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity);
    }, 0);

    // Create order
    const order = new Order({
      user: req.user._id,
      truck: cart.truck._id,
      items: cart.items.map(item => ({
        menuItem: item.menuItem._id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price,
        specialInstructions: item.specialInstructions
      })),
      totalAmount,
      pickupSlot: pickupSlot ? {
        startTime: new Date(pickupSlot.startTime),
        endTime: new Date(pickupSlot.endTime)
      } : null,
      customerName: req.user.name,
      customerEmail: req.user.email,
      status: 'pending'
    });

    await order.save();

    // Clear cart after order
    await Cart.findByIdAndDelete(cartId);

    await order.populate('truck', 'name location');

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/order/myOrders - View my orders (Customer)
router.get('/myOrders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('truck', 'name location')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/order/details/:orderId - View order details (Customer)
router.get('/details/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id })
      .populate('truck', 'name location')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/order/truckOwner/:orderId - View order details (Truck Owner)
router.get('/truckOwner/:orderId', auth, isTruckOwner, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('truck', 'name owner')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify truck ownership
    if (order.truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/order/truckOrders - View truck's orders (Truck Owner)
router.get('/truckOrders', auth, isTruckOwner, async (req, res) => {
  try {
    // Get owner's trucks
    const trucks = await Truck.find({ owner: req.user._id });
    const truckIds = trucks.map(t => t._id);

    const orders = await Order.find({ truck: { $in: truckIds } })
      .populate('truck', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/order/updateStatus/:orderId - Update order status (Truck Owner)
router.put('/updateStatus/:orderId', auth, isTruckOwner, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.orderId).populate('truck', 'owner');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify truck ownership
    if (order.truck.owner.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
