const nodemailer=require('nodemailer');

const dotenv=require('dotenv');
dotenv.config();

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PAAS
    }
});

exports.sendBookingEmail=async (userEmail ,eventTitle,date)=>{
    try{
     const mailOptions = {
        from:process.env.EMAIL_USER,
        to:userEmail,
        subject:`Booking Confirmed for ${eventTitle}`,
        text:`your booking for the ${eventTitle} on ${date} is confirmed`
     };
     await transporter.sendMail(mailOptions);
     console.log(`email send to ${userEmail}`)
    } catch(err){
        console.log(`Error sending email  to ${userEmail}` ,err)
    }
}

exports.sendOtpEmail=async (userEmail , otp , type)=>{
    try{
        const title=type==='account_verification'?"Verify your Eventora Account":"Event Booking";
        const msg=type==='account_verification'?"Use this otp to verify your new eventora account":"Use this otp for confirm event booking"
     const mailOptions = {
        from:process.env.EMAIL_USER,
        to:userEmail,
        subject:title,
        text:`${msg} /n Your OTP is ${otp}`
     };
     await transporter.sendMail(mailOptions);
     console.log(`OTP email send to ${userEmail} for ${type}`)
    } catch(err){
        console.log(`Error sending OTP email send to ${userEmail} for ${type}`,err)
    }
}

