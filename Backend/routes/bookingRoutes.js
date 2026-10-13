const express = require('express');
const BookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, BookingController.createBooking);
router.get('/my-bookings', auth, BookingController.getUserBookings);
router.put('/:id/status', auth, BookingController.updateBookingStatus);

module.exports = router;