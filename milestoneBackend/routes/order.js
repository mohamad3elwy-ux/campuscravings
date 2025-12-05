const express = require('express');
const router = express.Router();
const db = require('../connectors/knex');
const { getUser } = require('../utils/session');

// ============================================
// ORDER MANAGEMENT - 6 endpoints
// ============================================

// 15. POST /api/v1/order/new - Place order (Customer)
router.post('/new', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { scheduledPickupTime } = req.body;
    
    // Get cart items with truck info
    const cartItems = await db('FoodTruck.Carts as c')
      .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
      .select('c.*', 'm.truckId', 'm.name')
      .where('c.userId', user.userId);
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Check all items from same truck
    const truckIds = [...new Set(cartItems.map(item => item.truckId))];
    if (truckIds.length > 1) {
      return res.status(400).json({ error: 'Cannot order from multiple trucks' });
    }
    
    const truckId = truckIds[0];
    
    // Calculate total price
    let totalPrice = 0;
    for (const item of cartItems) {
      totalPrice += parseFloat(item.price) * item.quantity;
    }
    
    // Create order
    const [order] = await db('FoodTruck.Orders')
      .insert({
        userId: user.userId,
        truckId: truckId,
        orderStatus: 'pending',
        totalPrice: totalPrice,
        scheduledPickupTime: scheduledPickupTime || null,
        estimatedEarliestPickup: scheduledPickupTime || null
      })
      .returning('orderId');
    
    const orderId = order.orderId || order;
    
    // Insert order items
    for (const item of cartItems) {
      await db('FoodTruck.OrderItems').insert({
        orderId: orderId,
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price
      });
    }
    
    // Clear cart
    await db('FoodTruck.Carts')
      .where('userId', user.userId)
      .del();
    
    return res.status(200).json({ message: 'order placed successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 16. GET /api/v1/order/myOrders - View my orders (Customer)
router.get('/myOrders', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orders = await db('FoodTruck.Orders as o')
      .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
      .select(
        'o.orderId',
        'o.userId',
        'o.truckId',
        't.truckName',
        'o.orderStatus',
        'o.totalPrice',
        'o.scheduledPickupTime',
        'o.estimatedEarliestPickup',
        'o.createdAt'
      )
      .where('o.userId', user.userId)
      .orderBy('o.orderId', 'desc');
    
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 17. GET /api/v1/order/details/:orderId - View order details (Customer)
router.get('/details/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { orderId } = req.params;
    
    // Get order (verify ownership)
    const order = await db('FoodTruck.Orders as o')
      .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
      .select(
        'o.orderId',
        't.truckName',
        'o.orderStatus',
        'o.totalPrice',
        'o.scheduledPickupTime',
        'o.estimatedEarliestPickup',
        'o.createdAt'
      )
      .where('o.orderId', orderId)
      .where('o.userId', user.userId)
      .first();
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items
    const items = await db('FoodTruck.OrderItems as oi')
      .join('FoodTruck.MenuItems as m', 'oi.itemId', 'm.itemId')
      .select(
        'm.name as itemName',
        'oi.quantity',
        'oi.price'
      )
      .where('oi.orderId', orderId);
    
    return res.status(200).json({ ...order, items: items });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 18. GET /api/v1/order/truckOrders - View truck's orders (Truck Owner)
router.get('/truckOrders', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const orders = await db('FoodTruck.Orders as o')
      .join('FoodTruck.Users as u', 'o.userId', 'u.userId')
      .select(
        'o.orderId',
        'o.userId',
        'u.name as customerName',
        'o.orderStatus',
        'o.totalPrice',
        'o.scheduledPickupTime',
        'o.estimatedEarliestPickup',
        'o.createdAt'
      )
      .where('o.truckId', user.truckId)
      .orderBy('o.orderId', 'desc');
    
    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 19. GET /api/v1/order/truckOwner/:orderId - View order details (Truck Owner)
router.get('/truckOwner/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { orderId } = req.params;
    
    // Get order (verify ownership)
    const order = await db('FoodTruck.Orders as o')
      .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
      .select(
        'o.orderId',
        't.truckName',
        'o.orderStatus',
        'o.totalPrice',
        'o.scheduledPickupTime',
        'o.estimatedEarliestPickup',
        'o.createdAt'
      )
      .where('o.orderId', orderId)
      .where('o.truckId', user.truckId)
      .first();
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get order items
    const items = await db('FoodTruck.OrderItems as oi')
      .join('FoodTruck.MenuItems as m', 'oi.itemId', 'm.itemId')
      .select(
        'm.name as itemName',
        'oi.quantity',
        'oi.price'
      )
      .where('oi.orderId', orderId);
    
    return res.status(200).json({ ...order, items: items });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 20. PUT /api/v1/order/updateStatus/:orderId - Update order status (Truck Owner)
router.put('/updateStatus/:orderId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'truckOwner') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { orderId } = req.params;
    const { orderStatus, estimatedEarliestPickup } = req.body;
    
    // Verify order belongs to truck owner
    const existing = await db('FoodTruck.Orders')
      .where('orderId', orderId)
      .where('truckId', user.truckId)
      .first();
    
    if (!existing) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const updateData = { orderStatus: orderStatus };
    if (estimatedEarliestPickup) {
      updateData.estimatedEarliestPickup = estimatedEarliestPickup;
    }
    
    await db('FoodTruck.Orders')
      .where('orderId', orderId)
      .update(updateData);
    
    return res.status(200).json({ message: 'order status updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
