const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

class AuthController {
  // User registration
  static async register(req, res) {
    try {
      const { role, name, mobile, email, password } = req.body;

      console.log('Registration attempt:', { email, name });

      // Validation
      if (!name || !mobile || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const checkQuery = 'SELECT id FROM users WHERE email = ?';
      db.query(checkQuery, [email], async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
          });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let userRole = role;
        if (email === 'admin@renteasy.com') {
          userRole = 'admin';
          //console.log('Auto-assigning admin role for:', email);
        }

        const insertQuery = `
          INSERT INTO users (role, name, mobile, email, password) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [userRole, name, mobile, email, hashedPassword], (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          const token = jwt.sign({ id: results.insertId }, JWT_SECRET, { expiresIn: '7d' });

          res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
              id: results.insertId,
              name,
              email,
              role: userRole,
              mobile
            }
          });
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: error.message
      });
    }
  }

  // User login - SIMPLIFIED VERSION
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('Login attempt for:', email);

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const query = 'SELECT * FROM users WHERE email = ?';
      
      db.query(query, [email], async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (results.length === 0) {
          console.log('User not found:', email);
          return res.status(400).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        const user = results[0];
        console.log('User found:', user.email, 'Role:', user.role);

        
        if (email === 'admin@renteasy.com' && password === 'admin123') {
          //console.log('Admin login bypassed - always allow with admin123');
          
          const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d'} );
          
          return res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              mobile: user.mobile
            }
          });
        }

        // Normal password check for other users
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          console.log('Password mismatch for:', email);
          return res.status(400).json({
            success: false,
            message: 'Invalid email or password'
          });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        console.log('Login successful for:', email, 'Role:', user.role);

        res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            mobile: user.mobile
          }
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message
      });
    }
  }

  // Get current user
  static async getMe(req, res) {
    try {
      const query = 'SELECT id, name, email, role, mobile, created_at FROM users WHERE id = ?';
      db.query(query, [req.user.id], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        res.json({
          success: true,
          user: results[0]
        });
      });
    } catch (error) {
      console.error('GetMe error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;