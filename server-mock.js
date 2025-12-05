const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://campuscraving-demo.vercel.app", "https://campuscravings-b1be6d85j-mohamadtamerali656-2900s-projects.vercel.app", "https://campuscravings-3ukedjll8-mohamadtamerali656-2900s-projects.vercel.app"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Mock data from database setup
const mockData = global.mockData || {
  users: [
    {
      _id: 'user1',
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: '$2b$10$OVbG/gQr.IsoSwACmOd7ieVHyhPvKXNrxXczQOqmO2/uQ.3oxFtaG', // password123
      role: 'admin',
      createdAt: new Date()
    },
    {
      _id: 'user2',
      name: 'John Student',
      email: 'student@campus.edu',
      password: '$2b$10$OVbG/gQr.IsoSwACmOd7ieVHyhPvKXNrxXczQOqmO2/uQ.3oxFtaG', // password123
      role: 'student',
      studentId: 'STU001',
      createdAt: new Date()
    },
    {
      _id: 'user3',
      name: 'Sarah Manager',
      email: 'manager@campus.edu',
      password: '$2b$10$OVbG/gQr.IsoSwACmOd7ieVHyhPvKXNrxXczQOqmO2/uQ.3oxFtaG', // password123
      role: 'truck_manager',
      createdAt: new Date()
    }
  ],
  trucks: [
    {
      _id: 'truck1',
      name: 'Main Campus Grill',
      location: 'North Gate',
      description: 'Classic burgers and grilled favorites with a modern twist',
      operatingHours: { open: '08:00', close: '20:00' },
      currentQueueTime: 15,
      manager: 'user3',
      rating: 4.8,
      ratingCount: 45,
      isActive: true,
      image: null, // Add image URL here, e.g., 'https://example.com/burger-truck.jpg' or '/images/trucks/burger-truck.jpg'
      createdAt: new Date()
    },
    {
      _id: 'truck2',
      name: 'Taco Tuesday Express',
      location: 'Student Center Plaza',
      description: 'Authentic Mexican tacos and burritos made fresh daily',
      operatingHours: { open: '11:00', close: '18:00' },
      currentQueueTime: 12,
      manager: 'user3',
      rating: 4.6,
      ratingCount: 38,
      isActive: true,
      image: null, // Add image URL here
      createdAt: new Date()
    },
    {
      _id: 'truck3',
      name: 'Pizza Express',
      location: 'Engineering Building',
      description: 'Wood-fired pizzas with fresh ingredients and creative toppings',
      operatingHours: { open: '12:00', close: '21:00' },
      currentQueueTime: 18,
      manager: 'user3',
      rating: 4.7,
      ratingCount: 52,
      isActive: true,
      image: null, // Add image URL here
      createdAt: new Date()
    }
  ],
  menuItems: [
    {
      _id: 'item1',
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with lettuce, tomato, onion, and cheese',
      price: 8.99,
      category: 'main',
      foodTruck: 'truck1',
      preparationTime: 8,
      ingredients: ['Beef patty', 'Cheese', 'Lettuce', 'Tomato', 'Onion', 'Bun'],
      orderCount: 25,
      isAvailable: true,
      createdAt: new Date()
    },
    {
      _id: 'item2',
      name: 'Chicken Sandwich',
      description: 'Crispy chicken breast with mayo and pickles',
      price: 7.99,
      category: 'main',
      foodTruck: 'truck1',
      preparationTime: 10,
      ingredients: ['Chicken breast', 'Bun', 'Mayo', 'Pickles', 'Lettuce'],
      orderCount: 18,
      isAvailable: true,
      createdAt: new Date()
    },
    {
      _id: 'item3',
      name: 'French Fries',
      description: 'Golden crispy fries with sea salt',
      price: 3.99,
      category: 'appetizer',
      foodTruck: 'truck1',
      preparationTime: 5,
      ingredients: ['Potatoes', 'Sea salt', 'Oil'],
      orderCount: 42,
      isAvailable: true,
      createdAt: new Date()
    },
    {
      _id: 'item4',
      name: 'Beef Taco',
      description: 'Seasoned ground beef with fresh salsa and toppings',
      price: 6.99,
      category: 'main',
      foodTruck: 'truck2',
      preparationTime: 6,
      ingredients: ['Beef', 'Tortilla', 'Salsa', 'Cheese', 'Lettuce', 'Tomato'],
      orderCount: 35,
      isAvailable: true,
      createdAt: new Date()
    },
    {
      _id: 'item5',
      name: 'Chicken Burrito',
      description: 'Grilled chicken with rice, beans, and fresh vegetables',
      price: 8.99,
      category: 'main',
      foodTruck: 'truck2',
      preparationTime: 8,
      ingredients: ['Chicken', 'Rice', 'Beans', 'Cheese', 'Sour cream', 'Tortilla'],
      orderCount: 28,
      isAvailable: true,
      createdAt: new Date()
    },
    {
      _id: 'item6',
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomato sauce, and basil',
      price: 12.99,
      category: 'main',
      foodTruck: 'truck3',
      preparationTime: 15,
      ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Basil', 'Olive oil'],
      orderCount: 31,
      isAvailable: true,
      createdAt: new Date()
    },
    {
      _id: 'item7',
      name: 'Pepperoni Pizza',
      description: 'Classic pepperoni with mozzarella cheese',
      price: 14.99,
      category: 'main',
      foodTruck: 'truck3',
      preparationTime: 15,
      ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Pepperoni'],
      orderCount: 45,
      isAvailable: true,
      createdAt: new Date()
    },
    {
      _id: 'item8',
      name: 'Soft Drink',
      description: 'Canned soda or bottled water',
      price: 1.99,
      category: 'beverage',
      foodTruck: 'truck1',
      preparationTime: 1,
      ingredients: ['Carbonated water', 'Sugar', 'Natural flavors'],
      orderCount: 60,
      isAvailable: true,
      createdAt: new Date()
    }
  ],
  orders: []
};

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Helper functions
const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

const generateOrderNumber = () => {
  return 'ORD' + Date.now().toString().slice(-8);
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', phone, studentId } = req.body;

    const existingUser = mockData.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      _id: 'user' + (mockData.users.length + 1),
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      studentId,
      createdAt: new Date()
    };

    mockData.users.push(newUser);

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = mockData.users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = mockData.users.find(u => u._id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.get('/api/trucks', auth, (req, res) => {
  const { active = true, manager = false } = req.query;
  let trucks = mockData.trucks;
  
  if (active) {
    trucks = trucks.filter(truck => truck.isActive);
  }
  
  if (manager === 'true') {
    trucks = trucks.filter(truck => truck.manager === req.user.userId);
  }
  
  const trucksWithManager = trucks.map(truck => ({
    ...truck,
    manager: mockData.users.find(u => u._id === truck.manager)
  }));
  
  res.json(trucksWithManager);
});

app.get('/api/trucks/:id', (req, res) => {
  const truck = mockData.trucks.find(t => t._id === req.params.id);
  if (!truck) {
    return res.status(404).json({ message: 'Food truck not found' });
  }
  
  const truckWithManager = {
    ...truck,
    manager: mockData.users.find(u => u._id === truck.manager)
  };
  
  res.json(truckWithManager);
});

app.post('/api/trucks', auth, (req, res) => {
  const { name, location, description, operatingHours } = req.body;
  
  if (!name || !location) {
    return res.status(400).json({ message: 'Name and location are required' });
  }
  
  const newTruck = {
    _id: 'truck' + (mockData.trucks.length + 1),
    name,
    location,
    description: description || '',
    operatingHours: operatingHours || { open: '08:00', close: '20:00' },
    currentQueueTime: 15,
    manager: req.user.userId,
    rating: 0,
    ratingCount: 0,
    isActive: true,
    createdAt: new Date()
  };
  
  mockData.trucks.push(newTruck);
  
  const truckWithManager = {
    ...newTruck,
    manager: mockData.users.find(u => u._id === newTruck.manager)
  };
  
  res.status(201).json(truckWithManager);
});

app.put('/api/trucks/:id', auth, (req, res) => {
  const { id } = req.params;
  const truckIndex = mockData.trucks.findIndex(t => t._id === id);
  
  if (truckIndex === -1) {
    return res.status(404).json({ message: 'Food truck not found' });
  }
  
  const truck = mockData.trucks[truckIndex];
  
  // Check if user is authorized to update this truck
  if (req.user.role !== 'admin' && truck.manager !== req.user.userId) {
    return res.status(403).json({ message: 'Not authorized to update this truck' });
  }
  
  const { name, location, description, operatingHours, isActive } = req.body;
  
  // Update truck
  mockData.trucks[truckIndex] = {
    ...truck,
    name: name || truck.name,
    location: location || truck.location,
    description: description || truck.description,
    operatingHours: operatingHours || truck.operatingHours,
    isActive: isActive !== undefined ? isActive : truck.isActive,
    updatedAt: new Date()
  };
  
  const updatedTruck = {
    ...mockData.trucks[truckIndex],
    manager: mockData.users.find(u => u._id === mockData.trucks[truckIndex].manager)
  };
  
  res.json(updatedTruck);
});

app.post('/api/menu', auth, (req, res) => {
  const { name, description, price, category, foodTruck, ingredients, allergens, preparationTime } = req.body;
  
  if (!name || !price || !foodTruck) {
    return res.status(400).json({ message: 'Name, price, and food truck are required' });
  }
  
  // Check if user is authorized to add menu items to this truck
  const truck = mockData.trucks.find(t => t._id === foodTruck);
  if (!truck) {
    return res.status(404).json({ message: 'Food truck not found' });
  }
  
  if (req.user.role !== 'admin' && truck.manager !== req.user.userId) {
    return res.status(403).json({ message: 'Not authorized to add menu items to this truck' });
  }
  
  const newMenuItem = {
    _id: 'menu' + (mockData.menuItems.length + 1),
    name,
    description: description || '',
    price: parseFloat(price),
    category: category || 'Main',
    foodTruck,
    ingredients: ingredients || [],
    allergens: allergens || [],
    preparationTime: preparationTime || 15,
    isAvailable: true,
    orderCount: 0,
    rating: 0,
    ratingCount: 0,
    createdAt: new Date()
  };
  
  mockData.menuItems.push(newMenuItem);
  
  const menuItemWithTruck = {
    ...newMenuItem,
    foodTruck: mockData.trucks.find(t => t._id === newMenuItem.foodTruck)
  };
  
  res.status(201).json(menuItemWithTruck);
});

app.get('/api/menu', (req, res) => {
  const { truckId, available = true, category } = req.query;
  let menuItems = mockData.menuItems;
  
  if (truckId) {
    menuItems = menuItems.filter(item => item.foodTruck === truckId);
  }
  
  if (available) {
    menuItems = menuItems.filter(item => item.isAvailable);
  }
  
  if (category) {
    menuItems = menuItems.filter(item => item.category === category);
  }
  
  const menuWithTrucks = menuItems.map(item => ({
    ...item,
    foodTruck: mockData.trucks.find(t => t._id === item.foodTruck)
  }));
  
  res.json(menuWithTrucks);
});

app.get('/api/menu/:id', (req, res) => {
  const menuItem = mockData.menuItems.find(item => item._id === req.params.id);
  if (!menuItem) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  
  const menuItemWithTruck = {
    ...menuItem,
    foodTruck: mockData.trucks.find(t => t._id === menuItem.foodTruck)
  };
  
  res.json(menuItemWithTruck);
});

app.get('/api/orders', auth, (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  let orders = mockData.orders.filter(order => order.user === req.user.userId);
  
  if (status) {
    orders = orders.filter(order => order.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedOrders = orders.slice(startIndex, endIndex);
  
  const ordersWithDetails = paginatedOrders.map(order => ({
    ...order,
    foodTruck: mockData.trucks.find(t => t._id === order.foodTruck),
    items: order.items.map(item => ({
      ...item,
      menuItem: mockData.menuItems.find(m => m._id === item.menuItem)
    }))
  }));
  
  res.json({
    orders: ordersWithDetails,
    totalPages: Math.ceil(orders.length / limit),
    currentPage: parseInt(page),
    total: orders.length
  });
});

app.post('/api/orders', auth, async (req, res) => {
  try {
    const { foodTruck, items, pickupSlot, specialInstructions } = req.body;

    const truck = mockData.trucks.find(t => t._id === foodTruck);
    if (!truck || !truck.isActive) {
      return res.status(404).json({ message: 'Food truck not found or inactive' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = mockData.menuItems.find(m => m._id === item.menuItem);
      if (!menuItem || !menuItem.isAvailable || menuItem.foodTruck !== foodTruck) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not available` });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || ''
      });
    }

    const order = {
      _id: 'order' + (mockData.orders.length + 1),
      user: req.user.userId,
      foodTruck,
      items: orderItems,
      totalAmount,
      status: 'pending',
      pickupSlot,
      specialInstructions,
      estimatedPreparationTime: truck.currentQueueTime,
      orderNumber: generateOrderNumber(),
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockData.orders.push(order);

    const orderWithDetails = {
      ...order,
      foodTruck: truck,
      items: order.items.map(item => ({
        ...item,
        menuItem: mockData.menuItems.find(m => m._id === item.menuItem)
      }))
    };

    io.to(order._id).emit('orderCreated', orderWithDetails);

    res.status(201).json(orderWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/orders/:id', auth, (req, res) => {
  const order = mockData.orders.find(o => o._id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  if (req.user.role !== 'admin' && order.user !== req.user.userId) {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  
  const orderWithDetails = {
    ...order,
    foodTruck: mockData.trucks.find(t => t._id === order.foodTruck),
    user: mockData.users.find(u => u._id === order.user),
    items: order.items.map(item => ({
      ...item,
      menuItem: mockData.menuItems.find(m => m._id === item.menuItem)
    }))
  };
  
  res.json(orderWithDetails);
});

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinOrderUpdates', (orderId) => {
    socket.join(orderId);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/api/orders/manager/recent', auth, (req, res) => {
  const managerOrders = mockData.orders.filter(order => {
    const truck = mockData.trucks.find(t => t._id === order.foodTruck);
    return truck && truck.manager === req.user.userId;
  });
  
  const ordersWithDetails = managerOrders.slice(0, 10).map(order => ({
    ...order,
    foodTruck: mockData.trucks.find(t => t._id === order.foodTruck),
    user: mockData.users.find(u => u._id === order.user),
    items: order.items.map(item => ({
      ...item,
      menuItem: mockData.menuItems.find(m => m._id === item.menuItem)
    }))
  }));
  
  res.json({ orders: ordersWithDetails });
});

app.post('/api/orders/:id/status', auth, (req, res) => {
  const { status } = req.body;
  const orderIndex = mockData.orders.findIndex(o => o._id === req.params.id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  const order = mockData.orders[orderIndex];
  
  // Check if user is authorized to update this order
  if (req.user.role !== 'admin') {
    const truck = mockData.trucks.find(t => t._id === order.foodTruck);
    if (!truck || truck.manager !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
  }
  
  order.status = status;
  order.updatedAt = new Date();
  
  const orderWithDetails = {
    ...order,
    foodTruck: mockData.trucks.find(t => t._id === order.foodTruck),
    user: mockData.users.find(u => u._id === order.user),
    items: order.items.map(item => ({
      ...item,
      menuItem: mockData.menuItems.find(m => m._id === item.menuItem)
    }))
  };
  
  io.to(order._id).emit('orderStatusUpdated', orderWithDetails);
  
  res.json(orderWithDetails);
});

app.get('/', (req, res) => {
  res.json({ message: 'Campus Cravings API Server - Mock Mode' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Demo accounts:');
  console.log('Student: student@campus.edu / password123');
  console.log('Admin: admin@campus.edu / password123');
  console.log('Manager: manager@campus.edu / password123');
});

module.exports = { app, io };
