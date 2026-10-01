// Starts the web server. Run with: npm start
const config = require('./config');
const app = require('./app');

app.listen(config.port, () => {
  console.log(`Customer & Order Portal running at http://localhost:${config.port}`);
});
