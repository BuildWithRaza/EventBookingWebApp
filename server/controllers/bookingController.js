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
    const paymentStatus = req.body.paymentStatus;
    if(!['paid','unpaid'].includes(paymentStatus)){
        return res.status(400).json({message:"Invalid payment status"});
    }
    const booking = await Booking.findById(req.params.id).populate('eventID');
    if(!booking){
        return res.status(404).json({message:"Booking not found"});
    }

    if(booking.status === 'confirmed'){
        return res.status(400).json({message:"Booking already confirmed"});
    }

    const event = await Event.findById(booking.eventID);
    if(event.availableSeats <= 0){
        return res.status(400).json({message:"No available seats"});
    }

    booking.status = 'confirmed';

    if(paymentStatus){
        booking.paymentStatus = paymentStatus;
    }
    await booking.save();
    event.availableSeats -= 1;
    await event.save();
    await sendBookingEmail(req.user.email,event.title,event.date);
    res.json({message:"Booking confirmed successfully",booking});
}

exports.getMyBookings = async (req,res)=>{
    const bookings = await Booking.find({user:req.user._id}).populate('eventID');
    res.json({bookings});
}

exports.cancelBooking = async (req,res)=>{
    const booking = await Booking.findById(req.params.id);
    if(!booking){
        return res.status(404).json({message:"Booking not found"});
    }
    if(booking.user.toString() !== req.user._id.toString()){
        return res.status(403).json({message:"You are not authorized to cancel this booking"});
    }

    booking.status = 'cancelled';
    await booking.save();

    if(booking.status === 'confirmed'){
        const event = await Event.findById(booking.eventID._id);
        event.availableSeats += 1;
        await event.save();
    }
    await booking.remove();
    res.json({message:"Booking cancelled successfully"});
}
