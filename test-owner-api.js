// Test script to debug owner API endpoints
const http = require('http');

// First login as Sara (truck owner)
const loginData = JSON.stringify({
  email: 'sara@example.com',
  password: 'password123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Login response:', data);
    const response = JSON.parse(data);
    if (response.token) {
      testMenuItems(response.token);
      testTruckOrders(response.token);
    }
  });
});

loginReq.on('error', err => console.error('Login error:', err.message));
loginReq.write(loginData);
loginReq.end();

function testMenuItems(token) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/menuItem/view',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Menu Items response:', data);
    });
  });

  req.on('error', err => console.error('Menu error:', err.message));
  req.end();
}

function testTruckOrders(token) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/order/truckOrders',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Truck Orders response:', data);
    });
  });

  req.on('error', err => console.error('Orders error:', err.message));
  req.end();
}
