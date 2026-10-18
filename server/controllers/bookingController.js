const Booking=require('../models/Bookings');
const Event=require('../models/Event');
const OTP=require('../models/OTP');

const {sendBookingEmail,sendOtpEmail}=require('../utils/email');

const generateOtp =()=>{
    return Math.floor(100000 + Math.random()*900000).toString();
}

exports.sendOtp = async (req,res)=>{
    const otp = generateOtp();
    await OTP.findOneAndDelete({email:req.user.email,action:'event_booking'});
    await OTP.create({email:req.user.email,otp:otp,action:'event_booking'});
    await sendOtpEmail(req.user.email,otp,'event_booking');
    res.json({message:"OTP send to Email"});
}

exports.bookEvent = async (req,res)=>{
    const {eventId,otp}=req.body;
    
    const otpRecord = await OTP.findOne({email:req.user.email,action:'event_booking'});
    if(!otpRecord || otpRecord.otp !== otp){
        return res.status(400).json({message:"Invalid OTP"});
    }

    const event = await Event.findById(eventId);
    if(!event){
        return res.status(404).json({message:"Event not found"});
    }

    if(event.availableSeats <= 0){
        return res.status(400).json({message:"No available seats"});
    }

    const existingBooking = await Booking.findOne({user:req.user._id,event:eventId});
    if(existingBooking){
        return res.status(400).json({message:"You have already booked this event"});
    }

    const booking = await Booking.create({
        user:req.user._id,
        event:eventId,
        status:'pending',
        paymentStatus:'unpaid',
        amount:event.ticketPrice
    });

    await OTP.deleteMany({email:req.user.email,action:'event_booking'});
    res.status(201).json({message:"Booking created successfully",booking});
}

exports.confirmBooking = async (req,res)=>{
    try {
        const { paymentStatus } = req.body; // 'paid' or 'not_paid'
        const booking = await Booking.findById(req.params.id).populate('user').populate('event');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });

        const event = await Event.findById(booking.event._id);
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();

        event.availableSeats -= 1;
        await event.save();

        // Send email on admin confirmation
        await sendBookingEmail(booking.user.email, booking.user.name, booking.event.title);

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

exports.getMyBookings = async (req,res)=>{
   try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('event').populate('user', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ user: req.user.id }).populate('event').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}



exports.cancelBooking = async (req,res)=>{
     try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.event);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}
