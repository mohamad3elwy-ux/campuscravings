-- schema.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
);

CREATE TABLE IF NOT EXISTS trucks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    location TEXT
);

CREATE TABLE IF NOT EXISTS menu_items(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    truck_id INTEGER,
    name TEXT,
    price REAL,
    FOREIGN KEY(truck_id) REFERENCES trucks(id)
);

CREATE TABLE IF NOT EXISTS orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    items TEXT,
    pickup_time TEXT,
    status TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Seed sample data
INSERT OR IGNORE INTO users(name,email,password,role) VALUES('Mohamed Tamer','mohamed@giu.edu','password123','student');
INSERT OR IGNORE INTO trucks(name,location) VALUES('Main Campus Grill','North Gate');
INSERT OR IGNORE INTO menu_items(truck_id,name,price) VALUES(1,'Cheesy Fries',20.0),(1,'Chicken Shawarma',30.0);
