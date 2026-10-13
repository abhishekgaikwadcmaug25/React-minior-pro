const db = require('../config/database');

class BookingController {
  // Create booking enquiry
  static async createBooking(req, res) {
    try {
      const { property_id, rental_months, tenants_count, tenant_type } = req.body;

      console.log('Booking enquiry creation:', { 
        property_id, 
        rental_months, 
        tenants_count,
        tenant_type,
        user_id: req.user.id,
        user_role: req.user.role 
      });

      // Validation
      if (!property_id || !rental_months) {
        return res.status(400).json({
          success: false,
          message: 'Property ID and rental duration are required'
        });
      }

      // Validate data types
      if (isNaN(parseInt(property_id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid property ID'
        });
      }

      // Validate rental months
      const rentalMonths = parseInt(rental_months);
      if (rentalMonths < 1 || rentalMonths > 36) {
        return res.status(400).json({
          success: false,
          message: 'Rental duration must be between 1 and 36 months'
        });
      }

      // Validate tenants count
      const tenantsCount = parseInt(tenants_count) || 1;
      if (tenantsCount < 1 || tenantsCount > 10) {
        return res.status(400).json({
          success: false,
          message: 'Number of tenants must be between 1 and 10'
        });
      }

      // Validate tenant type
      const validTenantTypes = ['family', 'bachelors', 'couple', 'others'];
      const tenantType = tenant_type || 'family';
      if (!validTenantTypes.includes(tenantType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tenant type'
        });
      }

      // Check if user is trying to enquire about their own property
      const ownerCheckQuery = 'SELECT owner_id, status, price, title FROM properties WHERE id = ?';
      db.query(ownerCheckQuery, [property_id], (err, results) => {
        if (err) {
          console.error('Database error in owner check:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Property not found'
          });
        }

        const property = results[0];
        const propertyOwnerId = property.owner_id;
        
        // Check if user owns the property
        if (propertyOwnerId === req.user.id) {
          return res.status(400).json({
            success: false,
            message: 'You cannot send enquiry for your own property'
          });
        }

        // Check if property is available
        if (property.status !== 'available') {
          return res.status(400).json({
            success: false,
            message: 'Property is not available for rent'
          });
        }

        const insertQuery = `
          INSERT INTO bookings 
          (property_id, tenant_id, owner_id, rental_months, tenants_count, tenant_type) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
          parseInt(property_id),
          req.user.id,
          propertyOwnerId,
          rentalMonths,
          tenantsCount,
          tenantType
        ];

        console.log('Executing booking enquiry insert:', params);

        db.query(insertQuery, params, (err, results) => {
          if (err) {
            console.error('Database error in booking insert:', err);
            return res.status(500).json({
              success: false,
              message: 'Database error',
              error: err.message
            });
          }

          console.log('Booking enquiry created successfully with ID:', results.insertId);

          res.status(201).json({
            success: true,
            message: 'Enquiry sent successfully! The property owner will contact you soon.',
            booking: {
              id: results.insertId,
              property_id,
              tenant_id: req.user.id,
              owner_id: propertyOwnerId,
              rental_months: rentalMonths,
              tenants_count: tenantsCount,
              tenant_type: tenantType,
              status: 'pending'
            }
          });
        });
      });
    } catch (error) {
      console.error('Booking enquiry creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get user's bookings/enquiries
  static async getUserBookings(req, res) {
    try {
      let query = `
        SELECT b.*, p.title, p.location, p.city, p.price, p.image_url,
        owner.name as owner_name, owner.mobile as owner_contact,
        tenant.name as tenant_name, tenant.mobile as tenant_contact
        FROM bookings b
        LEFT JOIN properties p ON b.property_id = p.id
        LEFT JOIN users owner ON b.owner_id = owner.id
        LEFT JOIN users tenant ON b.tenant_id = tenant.id
        WHERE b.tenant_id = ? OR b.owner_id = ?
        ORDER BY b.created_at DESC
      `;

      db.query(query, [req.user.id, req.user.id], (err, results) => {
        if (err) {
          console.error('Database error in getUserBookings:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        res.json({
          success: true,
          count: results.length,
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

  // Update booking status (keep this the same)
  static async updateBookingStatus(req, res) {
    try {
      const { status } = req.body;
      const { id } = req.params;

      if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      // Check if booking exists and user has permission
      const checkQuery = 'SELECT * FROM bookings WHERE id = ? AND (owner_id = ? OR tenant_id = ?)';
      
      db.query(checkQuery, [id, req.user.id, req.user.id], (err, results) => {
        if (err) {
          console.error('Database error in updateBookingStatus:', err);
          return res.status(500).json({
            success: false,
            message: 'Database error'
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Enquiry not found or access denied'
          });
        }

        const updateQuery = 'UPDATE bookings SET status = ? WHERE id = ?';
        
        db.query(updateQuery, [status, id], (err) => {
          if (err) {
            console.error('Database error in status update:', err);
            return res.status(500).json({
              success: false,
              message: 'Database error'
            });
          }

          // If enquiry is confirmed, update property status
          if (status === 'confirmed') {
            const propertyQuery = 'UPDATE properties SET status = "rented" WHERE id = ?';
            db.query(propertyQuery, [results[0].property_id]);
          }

          res.json({
            success: true,
            message: 'Enquiry status updated successfully'
          });
        });
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = BookingController;