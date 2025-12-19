const express = require('express');
const router = express.Router();

// Customer Pages
router.get('/dashboard', (req, res) => {
  res.render('customerHomepage', { user: req.user });
});

router.get('/trucks', (req, res) => {
  res.render('trucks', { user: req.user });
});

router.get('/truckMenu/:truckId', (req, res) => {
  res.render('truckMenu', { user: req.user, truckId: req.params.truckId });
});

router.get('/cart', (req, res) => {
  res.render('cart', { user: req.user });
});

router.get('/myOrders', (req, res) => {
  res.render('myOrders', { user: req.user });
});

// Truck Owner Pages
router.get('/ownerDashboard', (req, res) => {
  res.render('ownerDashboard', { user: req.user });
});

router.get('/menuItems', (req, res) => {
  res.render('menuItems', { user: req.user });
});

router.get('/addMenuItem', (req, res) => {
  res.render('addMenuItem', { user: req.user });
});

router.get('/editMenuItem/:itemId', (req, res) => {
  res.render('ownerMenuEdit', { user: req.user, itemId: req.params.itemId });
});

router.get('/truckOrders', (req, res) => {
  res.render('truckOrders', { user: req.user });
});

module.exports = router;
