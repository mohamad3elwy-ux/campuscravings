const { Client } = require('pg');

const client = new Client({
  host: 'hopper.proxy.rlwy.net',
  port: 42966,
  user: 'postgres',
  password: 'pmmOsjWxooshuzUUTEZgcXqidqDwokjb',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

const schema = `
CREATE SCHEMA IF NOT EXISTS "FoodTruck";

CREATE TABLE IF NOT EXISTS "FoodTruck"."Users" (
  "userId" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "role" TEXT DEFAULT 'customer',
  "birthDate" DATE DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."Trucks" (
  "truckId" SERIAL PRIMARY KEY,
  "truckName" TEXT NOT NULL UNIQUE,
  "truckLogo" TEXT,
  "ownerId" INTEGER NOT NULL,
  "truckStatus" TEXT DEFAULT 'available',
  "orderStatus" TEXT DEFAULT 'available',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("ownerId") REFERENCES "FoodTruck"."Users"("userId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."MenuItems" (
  "itemId" SERIAL PRIMARY KEY,
  "truckId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" NUMERIC(10,2) NOT NULL,
  "category" TEXT NOT NULL,
  "status" TEXT DEFAULT 'available',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("truckId") REFERENCES "FoodTruck"."Trucks"("truckId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."Orders" (
  "orderId" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "truckId" INTEGER NOT NULL,
  "orderStatus" TEXT NOT NULL,
  "totalPrice" NUMERIC(10,2) NOT NULL,
  "scheduledPickupTime" TIMESTAMP,
  "estimatedEarliestPickup" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "FoodTruck"."Users"("userId") ON DELETE CASCADE,
  FOREIGN KEY ("truckId") REFERENCES "FoodTruck"."Trucks"("truckId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."OrderItems" (
  "orderItemId" SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL,
  "itemId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" NUMERIC(10,2) NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "FoodTruck"."Orders"("orderId") ON DELETE CASCADE,
  FOREIGN KEY ("itemId") REFERENCES "FoodTruck"."MenuItems"("itemId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."Carts" (
  "cartId" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "itemId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" NUMERIC(10,2) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "FoodTruck"."Users"("userId") ON DELETE CASCADE,
  FOREIGN KEY ("itemId") REFERENCES "FoodTruck"."MenuItems"("itemId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoodTruck"."Sessions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "FoodTruck"."Users"("userId") ON DELETE CASCADE
);
`;

const sampleData = `
INSERT INTO "FoodTruck"."Users" ("name", "email", "password", "role", "birthDate")
VALUES 
  ('Ahmed Mohamed', 'ahmed@example.com', 'password123', 'customer', '1998-05-15'),
  ('Sara Ali', 'sara@example.com', 'password123', 'truckOwner', '2000-08-22')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "FoodTruck"."Trucks" ("truckName", "truckLogo", "ownerId", "truckStatus", "orderStatus")
VALUES ('Tasty Tacos', NULL, 2, 'available', 'available')
ON CONFLICT ("truckName") DO NOTHING;

INSERT INTO "FoodTruck"."MenuItems" ("truckId", "name", "description", "price", "category", "status")
VALUES 
  (1, 'Beef Burger', 'Delicious beef burger with cheese', 45.99, 'Main Course', 'available'),
  (1, 'Chicken Wrap', 'Grilled chicken wrap', 35.50, 'Main Course', 'available'),
  (1, 'French Fries', 'Crispy golden fries', 15.00, 'Sides', 'available'),
  (1, 'Soft Drink', 'Cold refreshing drink', 10.00, 'Beverages', 'available')
ON CONFLICT DO NOTHING;
`;

async function setup() {
  try {
    await client.connect();
    console.log('Connected to Railway PostgreSQL');
    
    console.log('Creating schema and tables...');
    await client.query(schema);
    console.log('Schema created!');
    
    console.log('Inserting sample data...');
    await client.query(sampleData);
    console.log('Sample data inserted!');
    
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

setup();
