require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ', err.message);
    return;
  }
  console.log('Connected to MySQL database: ' + process.env.DB_NAME);
  connection.release();
});

module.exports = db;