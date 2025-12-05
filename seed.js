const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const FoodTruck = require('./models/FoodTruck');
const MenuItem = require('./models/MenuItem');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-cravings');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await FoodTruck.deleteMany({});
    await MenuItem.deleteMany({});

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
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
