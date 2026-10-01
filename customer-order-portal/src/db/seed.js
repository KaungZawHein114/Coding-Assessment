// Adds sample data (1 admin, 25 customers, 40 orders). Run with: npm run seed
// Safe to run twice: if sample data already exists, nothing is added.
const config = require('../config');
const customerModel = require('../models/customerModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const orderService = require('../services/orderService');
const { hashPassword } = require('../services/authService');
const { STATUSES } = require('../utils/orderStatus');

const FIRST = ['Alice', 'Bob', 'Carla', 'Dmitri', 'Elena', 'Farid', 'Grace', 'Hiro', 'Ines', 'Jamal', 'Kira', 'Liam', 'Mina', 'Noah', 'Olga', 'Pedro', 'Quinn', 'Rosa', 'Sven', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara'];
const LAST = ['Anderson', 'Brown', 'Chen', 'Dubois', 'Evans', 'Fischer', 'Garcia', 'Hughes', 'Ito', 'Johnson', 'Khan', 'Lopez', 'Meyer', 'Novak', 'Okafor', 'Patel', 'Quincy', 'Rossi', 'Silva', 'Tanaka', 'Ueda', 'Vargas', 'Walker', 'Xu', 'Young'];
// [item name, price in cents]
const ITEMS = [
  ['Wireless Mouse', 2499], ['Mechanical Keyboard', 8999], ['USB-C Hub', 3950], ['27" Monitor', 21900],
  ['Laptop Stand', 3200], ['Webcam HD', 5400], ['Desk Lamp', 2850], ['Noise-Cancelling Headphones', 15900],
  ['Ergonomic Chair', 28900], ['External SSD 1TB', 9900],
];

// Admin login
if (!userModel.findByEmail(config.defaultAdmin.email)) {
  userModel.create({
    email: config.defaultAdmin.email,
    password_hash: hashPassword(config.defaultAdmin.password),
  });
}

if (customerModel.total() > 0) {
  console.log('Sample data already exists - nothing added.');
} else {
  // 25 customers
  const customerIds = [];
  for (let i = 0; i < 25; i++) {
    customerIds.push(
      customerModel.create({
        name: `${FIRST[i]} ${LAST[i]}`,
        email: `${FIRST[i].toLowerCase()}.${LAST[i].toLowerCase()}@example.com`,
        phone: `555-01${String(i + 1).padStart(2, '0')}`,
        address: `${10 + i} Sample Avenue, Springfield`,
      })
    );
  }

  // 40 orders, shared between the first 18 customers only.
  // The other 7 customers have no orders, so you can test deleting them.
  for (let i = 0; i < 40; i++) {
    const [item, price] = ITEMS[i % ITEMS.length];
    const quantity = (i % 4) + 1;
    const orderId = orderModel.create({
      order_number: orderService.nextOrderNumber(),
      customer_id: customerIds[i % 18],
      item_name: item,
      quantity,
      unit_price_cents: price,
      total_cents: quantity * price,
      notes: i % 5 === 0 ? 'Please deliver in the morning.' : '',
    });
    // Spread the orders over all four statuses.
    orderModel.updateStatus(orderId, STATUSES[i % STATUSES.length]);
  }
  console.log('Sample data added: 25 customers and 40 orders.');
}

console.log(`Admin login: ${config.defaultAdmin.email} / ${config.defaultAdmin.password}`);
