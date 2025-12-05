const express = require('express');
const router = express.Router();
const db = require('../connectors/knex');
const { getUser } = require('../utils/session');

// ============================================
// CART MANAGEMENT (Customer) - 4 endpoints
// ============================================

// 11. POST /api/v1/cart/new - Add item to cart (Customer)
router.post('/new', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { itemId, quantity, price } = req.body;
    
    // Get the truckId of the new item
    const newItem = await db('FoodTruck.MenuItems')
      .select('truckId')
      .where('itemId', itemId)
      .first();
    
    if (!newItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Check existing cart items for different truck
    const existingCart = await db('FoodTruck.Carts as c')
      .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
      .select('m.truckId')
      .where('c.userId', user.userId)
      .first();
    
    if (existingCart && existingCart.truckId !== newItem.truckId) {
      return res.status(400).json({ message: 'Cannot order from multiple trucks' });
    }
    
    await db('FoodTruck.Carts').insert({
      userId: user.userId,
      itemId: itemId,
      quantity: quantity,
      price: price
    });
    
    return res.status(200).json({ message: 'item added to cart successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 12. GET /api/v1/cart/view - View cart (Customer)
router.get('/view', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const cartItems = await db('FoodTruck.Carts as c')
      .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
      .select(
        'c.cartId',
        'c.userId',
        'c.itemId',
        'm.name as itemName',
        'c.price',
        'c.quantity'
      )
      .where('c.userId', user.userId)
      .orderBy('c.cartId', 'asc');
    
    return res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 13. PUT /api/v1/cart/edit/:cartId - Update cart quantity (Customer)
router.put('/edit/:cartId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { cartId } = req.params;
    const { quantity } = req.body;
    
    // Verify ownership
    const existing = await db('FoodTruck.Carts')
      .where('cartId', cartId)
      .where('userId', user.userId)
      .first();
    
    if (!existing) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await db('FoodTruck.Carts')
      .where('cartId', cartId)
      .update({ quantity: quantity });
    
    return res.status(200).json({ message: 'cart updated successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 14. DELETE /api/v1/cart/delete/:cartId - Remove from cart (Customer)
router.delete('/delete/:cartId', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { cartId } = req.params;
    
    // Verify ownership
    const existing = await db('FoodTruck.Carts')
      .where('cartId', cartId)
      .where('userId', user.userId)
      .first();
    
    if (!existing) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await db('FoodTruck.Carts')
      .where('cartId', cartId)
      .del();
    
    return res.status(200).json({ message: 'item removed from cart successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
