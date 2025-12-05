// Mock data for demo mode when backend is not available
export const mockFoodTrucks = [
  {
    _id: 'truck-1',
    name: 'Burger Palace',
    location: 'Main Campus Quad',
    description: 'Gourmet burgers and fries with a twist',
    rating: 4.5,
    ratingCount: 128,
    isActive: true,
    currentQueueTime: 15,
    operatingHours: { open: '08:00', close: '20:00' },
    image: null
  },
  {
    _id: 'truck-2',
    name: 'Pizza Express',
    location: 'Engineering Building',
    description: 'Fresh wood-fired pizzas made to order',
    rating: 4.8,
    ratingCount: 96,
    isActive: true,
    currentQueueTime: 12,
    operatingHours: { open: '09:00', close: '21:00' },
    image: null
  },
  {
    _id: 'truck-3',
    name: 'Taco Fiesta',
    location: 'Student Union',
    description: 'Authentic Mexican tacos and burritos',
    rating: 4.3,
    ratingCount: 74,
    isActive: true,
    currentQueueTime: 10,
    operatingHours: { open: '11:00', close: '19:00' },
    image: null
  },
  {
    _id: 'truck-4',
    name: 'Noodle Bowl',
    location: 'Library Plaza',
    description: 'Asian-inspired noodles and rice bowls',
    rating: 4.6,
    ratingCount: 112,
    isActive: false,
    currentQueueTime: 18,
    operatingHours: { open: '10:00', close: '18:00' },
    image: null
  },
  {
    _id: 'truck-5',
    name: 'Salad Fresh',
    location: 'Science Complex',
    description: 'Healthy salads and wraps',
    rating: 4.4,
    ratingCount: 58,
    isActive: true,
    currentQueueTime: 8,
    operatingHours: { open: '08:30', close: '17:30' },
    image: null
  },
  {
    _id: 'truck-6',
    name: 'BBQ Smokehouse',
    location: 'Athletics Field',
    description: 'Smoky BBQ ribs and sandwiches',
    rating: 4.7,
    ratingCount: 203,
    isActive: true,
    currentQueueTime: 20,
    operatingHours: { open: '11:30', close: '20:30' },
    image: null
  }
];

export const mockMenuItems = {
  'truck-1': [
    {
      _id: 'item-1',
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with cheese, lettuce, tomato, and our special sauce',
      price: 8.99,
      category: 'Burgers',
      preparationTime: 10,
      ingredients: ['Beef', 'Cheese', 'Lettuce', 'Tomato', 'Bun', 'Special Sauce']
    },
    {
      _id: 'item-2',
      name: 'BBQ Bacon Burger',
      description: 'Beef patty with crispy bacon, BBQ sauce, onion rings',
      price: 10.99,
      category: 'Burgers',
      preparationTime: 12,
      ingredients: ['Beef', 'Bacon', 'BBQ Sauce', 'Onion Rings', 'Cheese']
    },
    {
      _id: 'item-3',
      name: 'Crispy Fries',
      description: 'Golden crispy french fries with sea salt',
      price: 3.99,
      category: 'Sides',
      preparationTime: 5,
      ingredients: ['Potatoes', 'Sea Salt', 'Oil']
    },
    {
      _id: 'item-4',
      name: 'Onion Rings',
      description: 'Crispy battered onion rings with dipping sauce',
      price: 4.99,
      category: 'Sides',
      preparationTime: 6,
      ingredients: ['Onions', 'Batter', 'Oil', 'Dipping Sauce']
    }
  ],
  'truck-2': [
    {
      _id: 'item-5',
      name: 'Margherita Pizza',
      description: 'Fresh mozzarella, tomatoes, basil on crispy crust',
      price: 12.99,
      category: 'Pizza',
      preparationTime: 15,
      ingredients: ['Dough', 'Mozzarella', 'Tomatoes', 'Basil', 'Olive Oil']
    },
    {
      _id: 'item-6',
      name: 'Pepperoni Deluxe',
      description: 'Classic pepperoni with extra cheese and herbs',
      price: 14.99,
      category: 'Pizza',
      preparationTime: 15,
      ingredients: ['Dough', 'Pepperoni', 'Mozzarella', 'Herbs', 'Tomato Sauce']
    },
    {
      _id: 'item-7',
      name: 'Garlic Bread',
      description: 'Toasted bread with garlic butter and herbs',
      price: 5.99,
      category: 'Sides',
      preparationTime: 8,
      ingredients: ['Bread', 'Garlic', 'Butter', 'Herbs']
    }
  ],
  'truck-3': [
    {
      _id: 'item-8',
      name: 'Chicken Tacos',
      description: 'Grilled chicken with fresh salsa and lime',
      price: 7.99,
      category: 'Tacos',
      preparationTime: 8,
      ingredients: ['Chicken', 'Tortillas', 'Salsa', 'Lime', 'Cilantro']
    },
    {
      _id: 'item-9',
      name: 'Beef Burrito',
      description: 'Seasoned beef with rice, beans, and guacamole',
      price: 9.99,
      category: 'Burritos',
      preparationTime: 10,
      ingredients: ['Beef', 'Tortilla', 'Rice', 'Beans', 'Guacamole', 'Cheese']
    }
  ]
};

export const mockOrders = [
  {
    _id: 'order-1',
    orderNumber: 'CC-1001',
    status: 'completed',
    totalAmount: 25.97,
    items: [
      { name: 'Classic Cheeseburger', quantity: 2, price: 8.99 },
      { name: 'Crispy Fries', quantity: 1, price: 3.99 }
    ],
    foodTruck: { name: 'Burger Palace' },
    pickupSlot: {
      startTime: '2024-01-15T12:30:00Z',
      endTime: '2024-01-15T12:45:00Z'
    },
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    _id: 'order-2',
    orderNumber: 'CC-1002',
    status: 'ready',
    totalAmount: 18.98,
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
      { name: 'Garlic Bread', quantity: 1, price: 5.99 }
    ],
    foodTruck: { name: 'Pizza Express' },
    pickupSlot: {
      startTime: '2024-01-15T13:00:00Z',
      endTime: '2024-01-15T13:15:00Z'
    },
    createdAt: '2024-01-15T12:30:00Z'
  }
];
