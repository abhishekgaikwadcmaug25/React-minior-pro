const express = require('express');
const AdminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', AdminController.getDashboardStats);

// User management
router.get('/users', AdminController.getAllUsers);
router.delete('/users/:id', AdminController.deleteUser);
router.put('/users/:id/role', AdminController.updateUserRole);

// Property management
router.get('/properties', AdminController.getAllProperties);
router.delete('/properties/:id', AdminController.deleteProperty);

// Booking management
router.get('/bookings', AdminController.getAllBookings);

module.exports = router;