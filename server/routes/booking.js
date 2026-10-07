const express=require('express');
const router=express.Router();
const {protect,admin}=require('../middlewares/auth');
const {bookEvent,sendOtp,getMyBookings,confirmBooking,cancelBooking}=require('../controllers/bookingController');

// Define routes
router.post('/', protect, admin, bookEvent);
router.post('/send-otp', protect,sendOtp);
router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/confirm', protect,admin, confirmBooking);
router.delete('/:id', protect, cancelBooking);

module.exports=router;