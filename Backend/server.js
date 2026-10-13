const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 5001;

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});