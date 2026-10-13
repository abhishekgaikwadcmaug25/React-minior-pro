const db = require('../config/database');

class PropertyController {
  // Get all properties with filtering
  static async getProperties(req, res) {
    try {
      let query = `
        SELECT p.*, u.name as owner_name, u.mobile as owner_contact 
        FROM properties p 
        LEFT JOIN users u ON p.owner_id = u.id 
        WHERE 1=1
      `;
      const params = [];

      // Filter by city
      if (req.query.city) {
        query += ' AND p.city = ?';
        params.push(req.query.city);
      }

      // Filter by price range
      if (req.query.minPrice) {
        query += ' AND p.price >= ?';
        params.push(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        query += ' AND p.price <= ?';
        params.push(req.query.maxPrice);
      }

      // Filter by bedrooms
      if (req.query.bedrooms) {
        query += ' AND p.bedrooms = ?';
        params.push(req.query.bedrooms);
      }

      // Filter by status
      if (req.query.status) {
        query += ' AND p.status = ?';
        params.push(req.query.status);
      }

      query += ' ORDER BY p.created_at DESC';

      db.query(query, params, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        res.json({
          success: true,
          count: results.length,
          properties: results
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get single property
  static async getProperty(req, res) {
    try {
      const query = `
        SELECT p.*, u.name as owner_name, u.mobile as owner_contact 
        FROM properties p 
        LEFT JOIN users u ON p.owner_id = u.id 
        WHERE p.id = ?
      `;

      db.query(query, [req.params.id], (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Property not found'
          });
        }

        res.json({
          success: true,
          property: results[0]
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Create property (owners only)
  static async createProperty(req, res) {
    try {
      const {
        title,
        description,
        location,
        city,
        price,
        bedrooms,
        bathrooms,
        area_sqft,
        image_url
      } = req.body;

      // Validation
      if (!title || !location || !city || !price) {
        return res.status(400).json({
          success: false,
          message: 'Title, location, city and price are required'
        });
      }

      const query = `
        INSERT INTO properties 
        (owner_id, title, description, location, city, price, bedrooms, bathrooms, area_sqft, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        req.user.id,
        title,
        description,
        location,
        city,
        price,
        bedrooms,
        bathrooms,
        area_sqft,
        image_url
      ];

      db.query(query, params, (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'Property created successfully',
          property: {
            id: results.insertId,
            ...req.body,
            owner_id: req.user.id
          }
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update property
  static async updateProperty(req, res) {
    try {
      // Check if property exists and user owns it
      const checkQuery = 'SELECT * FROM properties WHERE id = ? AND owner_id = ?';
      
      db.query(checkQuery, [req.params.id, req.user.id], (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Property not found or access denied'
          });
        }

        const {
          title,
          description,
          location,
          city,
          price,
          bedrooms,
          bathrooms,
          area_sqft,
          image_url,
          status
        } = req.body;

        const updateQuery = `
          UPDATE properties SET 
          title = ?, description = ?, location = ?, city = ?, price = ?, 
          bedrooms = ?, bathrooms = ?, area_sqft = ?, image_url = ?, status = ?
          WHERE id = ?
        `;

        const params = [
          title,
          description,
          location,
          city,
          price,
          bedrooms,
          bathrooms,
          area_sqft,
          image_url,
          status,
          req.params.id
        ];

        db.query(updateQuery, params, (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error',
              error: err.message
            });
          }

          res.json({
            success: true,
            message: 'Property updated successfully'
          });
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Delete property
  static async deleteProperty(req, res) {
    try {
      // Check if property exists and user owns it
      const checkQuery = 'SELECT * FROM properties WHERE id = ? AND owner_id = ?';
      
      db.query(checkQuery, [req.params.id, req.user.id], (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Property not found or access denied'
          });
        }

        const deleteQuery = 'DELETE FROM properties WHERE id = ?';
        
        db.query(deleteQuery, [req.params.id], (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Database error',
              error: err.message
            });
          }

          res.json({
            success: true,
            message: 'Property deleted successfully'
          });
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get user's properties
  static async getUserProperties(req, res) {
    try {
      const query = 'SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC';
      
      db.query(query, [req.user.id], (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
          });
        }

        res.json({
          success: true,
          count: results.length,
          properties: results
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = PropertyController;
