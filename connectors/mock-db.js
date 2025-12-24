// Mock database for evaluation - no external DB needed
const users = [
  { userId: 1, name: 'Ahmed Mohamed', email: 'ahmed@example.com', password: 'password123', role: 'customer', birthDate: '1998-05-15', truckId: null },
  { userId: 2, name: 'Sara Ali', email: 'sara@example.com', password: 'password123', role: 'truckOwner', birthDate: '2000-08-22', truckId: 1 }
];

const trucks = [
  { truckId: 1, truckName: 'Tasty Tacos', ownerId: 2, truckStatus: 'available', orderStatus: 'available' }
];

const menuItems = [
  { itemId: 1, truckId: 1, name: 'Beef Burger', description: 'Delicious beef burger', price: 45.99, category: 'Main Course', status: 'available' },
  { itemId: 2, truckId: 1, name: 'Chicken Wrap', description: 'Grilled chicken wrap', price: 35.50, category: 'Main Course', status: 'available' },
  { itemId: 3, truckId: 1, name: 'French Fries', description: 'Crispy golden fries', price: 15.00, category: 'Sides', status: 'available' },
  { itemId: 4, truckId: 1, name: 'Soft Drink', description: 'Cold refreshing drink', price: 10.00, category: 'Beverages', status: 'available' }
];

const carts = [
  { cartId: 1, userId: 1, itemId: 1, quantity: 2, price: 45.99 },
  { cartId: 2, userId: 1, itemId: 3, quantity: 1, price: 15.00 }
];

const orders = [
  { orderId: 1, userId: 1, truckId: 1, totalPrice: 106.98, orderStatus: 'pending', createdAt: new Date() },
  { orderId: 2, userId: 1, truckId: 1, totalPrice: 45.99, orderStatus: 'ready', createdAt: new Date() }
];

const orderItems = [
  { orderItemId: 1, orderId: 1, itemId: 1, quantity: 2, price: 45.99 },
  { orderItemId: 2, orderId: 1, itemId: 3, quantity: 1, price: 15.00 },
  { orderItemId: 3, orderId: 2, itemId: 1, quantity: 1, price: 45.99 }
];

const sessions = [];

let nextCartId = 3;
let nextOrderId = 3;
let nextOrderItemId = 4;
let nextSessionId = 1;
let nextItemId = 5;

const mockDb = {
  raw: async (query) => {
    const q = query.toLowerCase().trim();
    
    // SELECT queries
    
    // Handle Users with LEFT JOIN Trucks (from auth.js middleware)
    if (q.includes('select') && q.includes('from "foodtruck"."users"') && q.includes('left join')) {
      const userIdMatch = query.match(/userid.*?=.*?(\d+)/i);
      if (userIdMatch) {
        const user = users.find(u => u.userId === parseInt(userIdMatch[1]));
        if (user) {
          const truck = trucks.find(t => t.ownerId === user.userId);
          return { rows: [{ ...user, truckId: truck ? truck.truckId : null }] };
        }
        return { rows: [] };
      }
    }
    
    if (q.includes('select') && q.includes('from "foodtruck"."users"')) {
      if (q.includes('where')) {
        const emailMatch = query.match(/email.*?=.*?'([^']+)'/i);
        if (emailMatch) {
          const user = users.find(u => u.email === emailMatch[1]);
          return { rows: user ? [user] : [] };
        }
        const userIdMatch = query.match(/userid.*?=.*?(\d+)/i);
        if (userIdMatch) {
          const user = users.find(u => u.userId === parseInt(userIdMatch[1]));
          return { rows: user ? [user] : [] };
        }
      }
      return { rows: users };
    }
    
    // Handle JOIN query from getUser (Sessions JOIN Users LEFT JOIN Trucks)
    if (q.includes('select') && q.includes('from "foodtruck"."sessions"') && q.includes('join')) {
      const tokenMatch = query.match(/token.*?=.*?'([^']+)'/i);
      if (tokenMatch) {
        const session = sessions.find(s => s.token === tokenMatch[1]);
        if (session) {
          const user = users.find(u => u.userId === session.userId);
          if (user) {
            const truck = trucks.find(t => t.ownerId === user.userId);
            return { rows: [{
              id: session.id,
              userId: user.userId,
              token: session.token,
              expiresAt: session.expiresAt,
              name: user.name,
              birthDate: user.birthDate,
              email: user.email,
              password: user.password,
              role: user.role,
              truckId: truck ? truck.truckId : null
            }] };
          }
        }
        return { rows: [] };
      }
      return { rows: sessions };
    }
    
    if (q.includes('select') && q.includes('from "foodtruck"."sessions"')) {
      const tokenMatch = query.match(/token.*?=.*?'([^']+)'/i);
      if (tokenMatch) {
        const session = sessions.find(s => s.token === tokenMatch[1]);
        return { rows: session ? [session] : [] };
      }
      return { rows: sessions };
    }
    
    if (q.includes('select') && q.includes('from "foodtruck"."trucks"')) {
      if (q.includes('where')) {
        const ownerMatch = query.match(/ownerid.*?=.*?(\d+)/i);
        if (ownerMatch) {
          const truck = trucks.find(t => t.ownerId === parseInt(ownerMatch[1]));
          return { rows: truck ? [truck] : [] };
        }
        const truckIdMatch = query.match(/truckid.*?=.*?(\d+)/i);
        if (truckIdMatch) {
          const truck = trucks.find(t => t.truckId === parseInt(truckIdMatch[1]));
          return { rows: truck ? [truck] : [] };
        }
      }
      return { rows: trucks };
    }
    
    if (q.includes('select') && q.includes('from "foodtruck"."menuitems"')) {
      if (q.includes('where')) {
        const truckIdMatch = query.match(/truckid.*?=.*?(\d+)/i);
        if (truckIdMatch) {
          const items = menuItems.filter(m => m.truckId === parseInt(truckIdMatch[1]) && m.status === 'available');
          return { rows: items };
        }
        const itemIdMatch = query.match(/itemid.*?=.*?(\d+)/i);
        if (itemIdMatch) {
          const item = menuItems.find(m => m.itemId === parseInt(itemIdMatch[1]));
          return { rows: item ? [item] : [] };
        }
      }
      return { rows: menuItems.filter(m => m.status === 'available') };
    }
    
    if (q.includes('select') && q.includes('from "foodtruck"."carts"')) {
      const userIdMatch = query.match(/userid.*?=.*?(\d+)/i);
      if (userIdMatch) {
        const userCarts = carts.filter(c => c.userId === parseInt(userIdMatch[1]));
        const result = userCarts.map(c => {
          const item = menuItems.find(m => m.itemId === c.itemId);
          return { ...c, itemName: item ? item.name : 'Unknown' };
        });
        return { rows: result };
      }
      return { rows: carts };
    }
    
    // Handle Orders with JOIN (for truckOrders and myOrders)
    if (q.includes('select') && q.includes('from "foodtruck"."orders"') && q.includes('join')) {
      const truckIdMatch = query.match(/truckid.*?=.*?(\d+)/i);
      if (truckIdMatch) {
        // Truck orders - join with users to get customer name
        const truckOrders = orders.filter(o => o.truckId === parseInt(truckIdMatch[1]));
        const result = truckOrders.map(o => {
          const customer = users.find(u => u.userId === o.userId);
          return { ...o, customerName: customer ? customer.name : 'Unknown' };
        });
        return { rows: result };
      }
      const userIdMatch = query.match(/userid.*?=.*?(\d+)/i);
      if (userIdMatch) {
        // User orders - join with trucks to get truck name
        const userOrders = orders.filter(o => o.userId === parseInt(userIdMatch[1]));
        const result = userOrders.map(o => {
          const truck = trucks.find(t => t.truckId === o.truckId);
          return { ...o, truckName: truck ? truck.truckName : 'Unknown' };
        });
        return { rows: result };
      }
    }
    
    if (q.includes('select') && q.includes('from "foodtruck"."orders"')) {
      const userIdMatch = query.match(/userid.*?=.*?(\d+)/i);
      if (userIdMatch) {
        const userOrders = orders.filter(o => o.userId === parseInt(userIdMatch[1]));
        return { rows: userOrders };
      }
      const truckIdMatch = query.match(/truckid.*?=.*?(\d+)/i);
      if (truckIdMatch) {
        const truckOrders = orders.filter(o => o.truckId === parseInt(truckIdMatch[1]));
        return { rows: truckOrders };
      }
      const orderIdMatch = query.match(/orderid.*?=.*?(\d+)/i);
      if (orderIdMatch) {
        const order = orders.find(o => o.orderId === parseInt(orderIdMatch[1]));
        return { rows: order ? [order] : [] };
      }
      return { rows: orders };
    }
    
    if (q.includes('select') && q.includes('from "foodtruck"."orderitems"')) {
      const orderIdMatch = query.match(/orderid.*?=.*?(\d+)/i);
      if (orderIdMatch) {
        const items = orderItems.filter(oi => oi.orderId === parseInt(orderIdMatch[1]));
        const result = items.map(oi => {
          const item = menuItems.find(m => m.itemId === oi.itemId);
          return { ...oi, itemName: item ? item.name : 'Unknown' };
        });
        return { rows: result };
      }
      return { rows: orderItems };
    }
    
    // INSERT queries
    if (q.includes('insert into "foodtruck"."sessions"')) {
      const userIdMatch = query.match(/values.*?\((\d+)/i);
      const tokenMatch = query.match(/'(token-[^']+)'/i);
      if (userIdMatch && tokenMatch) {
        const session = {
          id: nextSessionId++,
          userId: parseInt(userIdMatch[1]),
          token: tokenMatch[1],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        sessions.push(session);
      }
      return { rows: [] };
    }
    
    if (q.includes('insert into "foodtruck"."carts"')) {
      const valuesMatch = query.match(/values.*?\((\d+).*?,.*?(\d+).*?,.*?(\d+).*?,.*?([\d.]+)/i);
      if (valuesMatch) {
        const cart = {
          cartId: nextCartId++,
          userId: parseInt(valuesMatch[1]),
          itemId: parseInt(valuesMatch[2]),
          quantity: parseInt(valuesMatch[3]),
          price: parseFloat(valuesMatch[4])
        };
        carts.push(cart);
        return { rows: [cart] };
      }
      return { rows: [] };
    }
    
    if (q.includes('insert into "foodtruck"."orders"')) {
      const valuesMatch = query.match(/values.*?\((\d+).*?,.*?(\d+).*?,.*?([\d.]+)/i);
      if (valuesMatch) {
        const order = {
          orderId: nextOrderId++,
          userId: parseInt(valuesMatch[1]),
          truckId: parseInt(valuesMatch[2]),
          totalPrice: parseFloat(valuesMatch[3]),
          orderStatus: 'pending',
          createdAt: new Date()
        };
        orders.push(order);
        return { rows: [order] };
      }
      return { rows: [] };
    }
    
    if (q.includes('insert into "foodtruck"."orderitems"')) {
      const valuesMatch = query.match(/values.*?\((\d+).*?,.*?(\d+).*?,.*?(\d+).*?,.*?([\d.]+)/i);
      if (valuesMatch) {
        const orderItem = {
          orderItemId: nextOrderItemId++,
          orderId: parseInt(valuesMatch[1]),
          itemId: parseInt(valuesMatch[2]),
          quantity: parseInt(valuesMatch[3]),
          price: parseFloat(valuesMatch[4])
        };
        orderItems.push(orderItem);
      }
      return { rows: [] };
    }
    
    if (q.includes('insert into "foodtruck"."menuitems"')) {
      const truckIdMatch = query.match(/values.*?\((\d+)/i);
      const nameMatch = query.match(/'([^']+)'.*?'([^']*)'.*?([\d.]+).*?'([^']+)'/i);
      if (truckIdMatch && nameMatch) {
        const item = {
          itemId: nextItemId++,
          truckId: parseInt(truckIdMatch[1]),
          name: nameMatch[1],
          description: nameMatch[2],
          price: parseFloat(nameMatch[3]),
          category: nameMatch[4],
          status: 'available'
        };
        menuItems.push(item);
      }
      return { rows: [] };
    }
    
    // UPDATE queries
    if (q.includes('update "foodtruck"."carts"')) {
      const quantityMatch = query.match(/quantity.*?=.*?(\d+)/i);
      const cartIdMatch = query.match(/cartid.*?=.*?(\d+)/i);
      if (quantityMatch && cartIdMatch) {
        const cart = carts.find(c => c.cartId === parseInt(cartIdMatch[1]));
        if (cart) cart.quantity = parseInt(quantityMatch[1]);
      }
      return { rows: [] };
    }
    
    if (q.includes('update "foodtruck"."orders"')) {
      const statusMatch = query.match(/orderstatus.*?=.*?'([^']+)'/i);
      const orderIdMatch = query.match(/orderid.*?=.*?(\d+)/i);
      if (statusMatch && orderIdMatch) {
        const order = orders.find(o => o.orderId === parseInt(orderIdMatch[1]));
        if (order) order.orderStatus = statusMatch[1];
      }
      return { rows: [] };
    }
    
    if (q.includes('update "foodtruck"."menuitems"')) {
      const itemIdMatch = query.match(/itemid.*?=.*?(\d+)/i);
      if (itemIdMatch) {
        const item = menuItems.find(m => m.itemId === parseInt(itemIdMatch[1]));
        if (item) {
          if (q.includes('status')) {
            const statusMatch = query.match(/status.*?=.*?'([^']+)'/i);
            if (statusMatch) item.status = statusMatch[1];
          } else {
            const nameMatch = query.match(/name.*?=.*?'([^']+)'/i);
            const priceMatch = query.match(/price.*?=.*?([\d.]+)/i);
            const categoryMatch = query.match(/category.*?=.*?'([^']+)'/i);
            if (nameMatch) item.name = nameMatch[1];
            if (priceMatch) item.price = parseFloat(priceMatch[1]);
            if (categoryMatch) item.category = categoryMatch[1];
          }
        }
      }
      return { rows: [] };
    }
    
    // DELETE queries
    if (q.includes('delete from "foodtruck"."carts"')) {
      const cartIdMatch = query.match(/cartid.*?=.*?(\d+)/i);
      const userIdMatch = query.match(/userid.*?=.*?(\d+)/i);
      if (cartIdMatch) {
        const idx = carts.findIndex(c => c.cartId === parseInt(cartIdMatch[1]));
        if (idx > -1) carts.splice(idx, 1);
      } else if (userIdMatch) {
        const userId = parseInt(userIdMatch[1]);
        for (let i = carts.length - 1; i >= 0; i--) {
          if (carts[i].userId === userId) carts.splice(i, 1);
        }
      }
      return { rows: [] };
    }
    
    return { rows: [] };
  }
};

module.exports = mockDb;
