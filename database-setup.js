const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// In-memory fallback for demo purposes
const inMemoryDB = {
  users: [],
  trucks: [],
  menuItems: [],
  orders: []
};

const User = require('./models/User');
const FoodTruck = require('./models/FoodTruck');
const MenuItem = require('./models/MenuItem');

const seedData = async () => {
  try {
    // Try to connect to MongoDB first
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-cravings');
      console.log('Connected to MongoDB');
      
      await User.deleteMany({});
      await FoodTruck.deleteMany({});
      await MenuItem.deleteMany({});
      
      console.log('Connected to real MongoDB - proceeding with database seeding...');
    } catch (mongoError) {
      console.log('MongoDB not available, using in-memory database for demo');
      
      // Create mock data without database
      const mockUsers = [
        {
          _id: 'user1',
          name: 'Admin User',
          email: 'admin@campus.edu',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
          role: 'admin',
          createdAt: new Date()
        },
        {
          _id: 'user2',
          name: 'John Student',
          email: 'student@campus.edu',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
          role: 'student',
          studentId: 'STU001',
          createdAt: new Date()
        },
        {
          _id: 'user3',
          name: 'Sarah Manager',
          email: 'manager@campus.edu',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
          role: 'truck_manager',
          createdAt: new Date()
        }
      ];

      const mockTrucks = [
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
          createdAt: new Date()
        }
      ];

      const mockMenuItems = [
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
      ];

      // Store in global scope for the app to use
      global.mockData = {
        users: mockUsers,
        trucks: mockTrucks,
        menuItems: mockMenuItems,
        orders: []
      };

      console.log('Mock data created successfully!');
      console.log('Demo accounts:');
      console.log('Student: student@campus.edu / password123');
      console.log('Admin: admin@campus.edu / password123');
      console.log('Manager: manager@campus.edu / password123');
      
      process.exit(0);
      return;
    }

    // If we get here, MongoDB is connected
    const users = [
      {
        name: 'Admin User',
        email: 'admin@campus.edu',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'John Student',
        email: 'student@campus.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU001'
      },
      {
        name: 'Sarah Manager',
        email: 'manager@campus.edu',
        password: 'manager123',
        role: 'truck_manager'
      },
      {
        name: 'Mike Student',
        email: 'mike@campus.edu',
        password: 'password123',
        role: 'student',
        studentId: 'STU002'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Users created');

    const trucks = [
      {
        name: 'Main Campus Grill',
        location: 'North Gate',
        description: 'Classic burgers and grilled favorites with a modern twist',
        operatingHours: { open: '08:00', close: '20:00' },
        currentQueueTime: 15,
        manager: createdUsers[2]._id,
        rating: 4.8,
        ratingCount: 45
      },
      {
        name: 'Taco Tuesday Express',
        location: 'Student Center Plaza',
        description: 'Authentic Mexican tacos and burritos made fresh daily',
        operatingHours: { open: '11:00', close: '18:00' },
        currentQueueTime: 12,
        manager: createdUsers[2]._id,
        rating: 4.6,
        ratingCount: 38
      },
      {
        name: 'Pizza Express',
        location: 'Engineering Building',
        description: 'Wood-fired pizzas with fresh ingredients and creative toppings',
        operatingHours: { open: '12:00', close: '21:00' },
        currentQueueTime: 18,
        manager: createdUsers[2]._id,
        rating: 4.7,
        ratingCount: 52
      }
    ];

    const createdTrucks = await FoodTruck.create(trucks);
    console.log('Food trucks created');

    const menuItems = [
      {
        name: 'Classic Cheeseburger',
        description: 'Juicy beef patty with lettuce, tomato, onion, and cheese',
        price: 8.99,
        category: 'main',
        foodTruck: createdTrucks[0]._id,
        preparationTime: 8,
        ingredients: ['Beef patty', 'Cheese', 'Lettuce', 'Tomato', 'Onion', 'Bun'],
        orderCount: 25
      },
      {
        name: 'Chicken Sandwich',
        description: 'Crispy chicken breast with mayo and pickles',
        price: 7.99,
        category: 'main',
        foodTruck: createdTrucks[0]._id,
        preparationTime: 10,
        ingredients: ['Chicken breast', 'Bun', 'Mayo', 'Pickles', 'Lettuce'],
        orderCount: 18
      },
      {
        name: 'French Fries',
        description: 'Golden crispy fries with sea salt',
        price: 3.99,
        category: 'appetizer',
        foodTruck: createdTrucks[0]._id,
        preparationTime: 5,
        ingredients: ['Potatoes', 'Sea salt', 'Oil'],
        orderCount: 42
      },
      {
        name: 'Beef Taco',
        description: 'Seasoned ground beef with fresh salsa and toppings',
        price: 6.99,
        category: 'main',
        foodTruck: createdTrucks[1]._id,
        preparationTime: 6,
        ingredients: ['Beef', 'Tortilla', 'Salsa', 'Cheese', 'Lettuce', 'Tomato'],
        orderCount: 35
      },
      {
        name: 'Chicken Burrito',
        description: 'Grilled chicken with rice, beans, and fresh vegetables',
        price: 8.99,
        category: 'main',
        foodTruck: createdTrucks[1]._id,
        preparationTime: 8,
        ingredients: ['Chicken', 'Rice', 'Beans', 'Cheese', 'Sour cream', 'Tortilla'],
        orderCount: 28
      },
      {
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, and basil',
        price: 12.99,
        category: 'main',
        foodTruck: createdTrucks[2]._id,
        preparationTime: 15,
        ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Basil', 'Olive oil'],
        orderCount: 31
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with mozzarella cheese',
        price: 14.99,
        category: 'main',
        foodTruck: createdTrucks[2]._id,
        preparationTime: 15,
        ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Pepperoni'],
        orderCount: 45
      },
      {
        name: 'Soft Drink',
        description: 'Canned soda or bottled water',
        price: 1.99,
        category: 'beverage',
        foodTruck: createdTrucks[0]._id,
        preparationTime: 1,
        ingredients: ['Carbonated water', 'Sugar', 'Natural flavors'],
        orderCount: 60
      }
    ];

    await MenuItem.create(menuItems);
    console.log('Menu items created');

    console.log('Database seeded successfully!');
    console.log('Demo accounts:');
    console.log('Student: student@campus.edu / password123');
    console.log('Admin: admin@campus.edu / password123');
    console.log('Manager: manager@campus.edu / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
