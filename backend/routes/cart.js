const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { auth, isCustomer } = require('../middleware/auth');

// POST /api/v1/cart/new - Add item to cart (Customer)
router.post('/new', auth, async (req, res) => {
  try {
    const { menuItemId, quantity, specialInstructions } = req.body;

    // Get menu item to find truck
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Find or create cart for this user and truck
    let cart = await Cart.findOne({ user: req.user._id, truck: menuItem.truck });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        truck: menuItem.truck,
        items: []
      });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity || 1;
      if (specialInstructions) {
        cart.items[existingItemIndex].specialInstructions = specialInstructions;
      }
    } else {
      // Add new item
      cart.items.push({
        menuItem: menuItemId,
        quantity: quantity || 1,
        specialInstructions: specialInstructions || ''
      });
    }

    await cart.save();
    await cart.populate('items.menuItem');

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cart/view - View cart (Customer)
router.get('/view', auth, async (req, res) => {
  try {
    const carts = await Cart.find({ user: req.user._id })
      .populate('items.menuItem')
      .populate('truck', 'name location');

    // Calculate totals for each cart
    const cartsWithTotals = carts.map(cart => {
      const total = cart.items.reduce((sum, item) => {
        return sum + (item.menuItem.price * item.quantity);
      }, 0);
      return { ...cart.toObject(), total };
    });

    res.json(cartsWithTotals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/cart/edit/:cartId - Update cart quantity (Customer)
router.put('/edit/:cartId', auth, async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    const cart = await Cart.findOne({ _id: req.params.cartId, user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.menuItem.toString() === menuItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    // Delete cart if empty
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(req.params.cartId);
      return res.json({ message: 'Cart is now empty and has been removed' });
    }

    await cart.save();
    await cart.populate('items.menuItem');

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/cart/delete/:cartId - Remove from cart (Customer)
router.delete('/delete/:cartId', auth, async (req, res) => {
  try {
    const { menuItemId } = req.body;

    const cart = await Cart.findOne({ _id: req.params.cartId, user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    if (menuItemId) {
      // Remove specific item
      cart.items = cart.items.filter(
        item => item.menuItem.toString() !== menuItemId
      );

      if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(req.params.cartId);
        return res.json({ message: 'Cart is now empty and has been removed' });
      }

      await cart.save();
      res.json({ message: 'Item removed from cart', cart });
    } else {
      // Delete entire cart
      await Cart.findByIdAndDelete(req.params.cartId);
      res.json({ message: 'Cart deleted' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
