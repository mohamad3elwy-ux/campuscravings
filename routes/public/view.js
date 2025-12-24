const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('login');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

// Customer pages
router.get('/customer/home', (req, res) => {
  res.render('customerHomepage');
});

router.get('/customer/trucks', (req, res) => {
  res.render('trucks');
});

router.get('/customer/truck/:truckId', (req, res) => {
  res.render('truckMenu');
});

router.get('/customer/cart', (req, res) => {
  res.render('cart');
});

router.get('/customer/orders', (req, res) => {
  res.render('myOrders');
});

// Owner pages
router.get('/owner/dashboard', (req, res) => {
  res.render('ownerDashboard');
});

router.get('/owner/menu', (req, res) => {
  res.render('menuItems');
});

router.get('/owner/menu/add', (req, res) => {
  res.render('addMenuItem');
});

router.get('/owner/menu/edit/:itemId', (req, res) => {
  res.render('ownerMenuEdit');
});

router.get('/owner/orders', (req, res) => {
  res.render('truckOrders');
});

module.exports = router;
