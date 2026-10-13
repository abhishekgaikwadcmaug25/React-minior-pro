const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { role, name, mobile, email, password } = userData;
    
    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    return new Promise((resolve, reject) => {
      db.query(checkQuery, [email], async (err, results) => {
        if (err) return reject(err);
        
        if (results.length > 0) {
          return reject(new Error('User already exists with this email'));
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const insertQuery = `
          INSERT INTO users (role, name, mobile, email, password) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [role, name, mobile, email, hashedPassword], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.query(query, [email], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, name, email, role, mobile, created_at FROM users WHERE id = ?';
      db.query(query, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }
}

module.exports = User;