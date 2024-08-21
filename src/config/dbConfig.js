const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('An error occurred:', err.stack);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
