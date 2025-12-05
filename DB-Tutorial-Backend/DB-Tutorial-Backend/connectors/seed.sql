-- ============================================
-- CAMPUS CRAVINGS - Seed Data
-- Run this after scripts.sql to populate test data
-- ============================================

-- DEMO USERS (passwords should be hashed in production)
INSERT INTO "campusCravings"."User" (name, email, password, role) VALUES
('Admin User', 'admin@campus.edu', 'admin123', 'admin'),
('Truck Manager', 'manager@campus.edu', 'manager123', 'truck_owner'),
('Student User', 'student@campus.edu', 'password123', 'customer'),
('Ahmed Hassan', 'ahmed@campus.edu', 'password123', 'customer'),
('Sara Mohamed', 'sara@campus.edu', 'password123', 'truck_owner');

-- DEMO FOOD TRUCKS
INSERT INTO "campusCravings"."Truck" (name, description, location, ownerId, openTime, closeTime, isActive, isApproved, rating) VALUES
('Campus Grill', 'Best burgers and grilled items on campus', 'Main Campus - Building A', 2, '08:00', '20:00', true, true, 4.5),
('Taco Fiesta', 'Authentic Mexican street food', 'Engineering Building', 5, '10:00', '22:00', true, true, 4.2),
('Pizza Express', 'Fresh wood-fired pizzas', 'Student Center', 2, '11:00', '23:00', true, true, 4.8);

-- DEMO MENU ITEMS
INSERT INTO "campusCravings"."MenuItem" (name, description, price, category, truckId, preparationTime, isAvailable) VALUES
-- Campus Grill Menu
('Classic Burger', 'Juicy beef patty with fresh vegetables', 45.00, 'Main', 1, 10, true),
('Cheese Burger', 'Classic burger with melted cheddar', 55.00, 'Main', 1, 12, true),
('Chicken Sandwich', 'Grilled chicken with special sauce', 40.00, 'Main', 1, 8, true),
('French Fries', 'Crispy golden fries', 20.00, 'Sides', 1, 5, true),
('Onion Rings', 'Crispy battered onion rings', 25.00, 'Sides', 1, 5, true),
('Soft Drink', 'Coca-Cola, Sprite, or Fanta', 15.00, 'Drinks', 1, 1, true),

-- Taco Fiesta Menu
('Beef Tacos', 'Three soft tacos with seasoned beef', 50.00, 'Main', 2, 8, true),
('Chicken Quesadilla', 'Grilled quesadilla with chicken and cheese', 45.00, 'Main', 2, 10, true),
('Nachos Supreme', 'Loaded nachos with all toppings', 35.00, 'Sides', 2, 7, true),
('Churros', 'Sweet fried dough with cinnamon sugar', 20.00, 'Desserts', 2, 5, true),
('Horchata', 'Traditional Mexican rice drink', 18.00, 'Drinks', 2, 2, true),

-- Pizza Express Menu
('Margherita Pizza', 'Classic tomato, mozzarella, and basil', 65.00, 'Main', 3, 15, true),
('Pepperoni Pizza', 'Loaded with pepperoni slices', 75.00, 'Main', 3, 15, true),
('Garlic Bread', 'Toasted bread with garlic butter', 25.00, 'Sides', 3, 5, true),
('Tiramisu', 'Classic Italian coffee dessert', 35.00, 'Desserts', 3, 2, true);

-- DEMO ORDERS
INSERT INTO "campusCravings"."Order" (orderNumber, userId, truckId, totalAmount, status, customerName, customerEmail) VALUES
('ORD-001', 3, 1, 120.00, 'completed', 'Student User', 'student@campus.edu'),
('ORD-002', 4, 2, 85.00, 'preparing', 'Ahmed Hassan', 'ahmed@campus.edu'),
('ORD-003', 3, 3, 100.00, 'pending', 'Student User', 'student@campus.edu');

-- DEMO ORDER ITEMS
INSERT INTO "campusCravings"."OrderItem" (orderId, menuItemId, name, quantity, price) VALUES
(1, 1, 'Classic Burger', 2, 45.00),
(1, 4, 'French Fries', 1, 20.00),
(1, 6, 'Soft Drink', 1, 15.00),
(2, 7, 'Beef Tacos', 1, 50.00),
(2, 9, 'Nachos Supreme', 1, 35.00),
(3, 13, 'Margherita Pizza', 1, 65.00),
(3, 16, 'Tiramisu', 1, 35.00);