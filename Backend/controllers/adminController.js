const db = require('../config/database');

class AdminController {
  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'tenant') as total_tenants,
          (SELECT COUNT(*) FROM users WHERE role = 'owner') as total_owners,
          (SELECT COUNT(*) FROM properties) as total_properties,
          (SELECT COUNT(*) FROM properties WHERE status = 'available') as available_properties,
          (SELECT COUNT(*) FROM properties WHERE status = 'rented') as rented_properties,
          (SELECT COUNT(*) FROM bookings) as total_bookings,
          (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
          (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings
      `;

      db.query(statsQuery, (err, results) => {
        if (err) {
          console.error('Error fetching admin stats:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          success: true,
          stats: results[0]
        });
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get all users
  static async getAllUsers(req, res) {
    try {
      const query = `
        SELECT id, name, email, role, mobile, created_at 
        FROM users 
        ORDER BY created_at DESC
      `;

      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          success: true,
          users: results
        });
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get all properties with owner info
  static async getAllProperties(req, res) {
    try {
      const query = `
        SELECT p.*, u.name as owner_name, u.email as owner_email 
        FROM properties p 
        LEFT JOIN users u ON p.owner_id = u.id 
        ORDER BY p.created_at DESC
      `;

      db.query(query, (err, results) =>{
        if (err) {
          console.error('Error fetching properties:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          success: true,
          properties: results
        });
      });
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get all bookings with details
  static async getAllBookings(req, res) {
    try {
      const query = `
        SELECT 
          b.*,
          p.title as property_title,
          p.location as property_location,
          tenant.name as tenant_name,
          owner.name as owner_name
        FROM bookings b
        LEFT JOIN properties p ON b.property_id = p.id
        LEFT JOIN users tenant ON b.tenant_id = tenant.id
        LEFT JOIN users owner ON b.owner_id = owner.id
        ORDER BY b.created_at DESC
      `;

      db.query(query, (err, results) =>{
        if (err) {
          console.error('Error fetching bookings:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          success: true,
          bookings: results
        });
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete any property (admin power)
  static async deleteProperty(req, res) {
    try {
      const { id } = req.params;

      const deleteQuery = 'DELETE FROM properties WHERE id = ?';
      
      db.query(deleteQuery, [id], (err, results) => {
        if (err) {
          console.error('Error deleting property:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'Property not found'
          });
        }

        res.json({
          success: true,
          message: 'Property deleted successfully'
        });
      });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete any user (admin power)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      
      db.query(deleteQuery, [id], (err, results) => {
        if (err) {
          console.error('Error deleting user:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        res.json({
          success: true,
          message: 'User deleted successfully'
        });
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update user role
  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['tenant', 'owner', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      const updateQuery = 'UPDATE users SET role = ? WHERE id = ?';
      
      db.query(updateQuery, [role, id], (err, results) => {
        if (err) {
          console.error('Error updating user role:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        res.json({
          success: true,
          message: 'User role updated successfully'
        });
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = AdminController;