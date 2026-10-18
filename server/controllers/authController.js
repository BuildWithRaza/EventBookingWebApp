
const User=require('../models/User');
const OTP=require('../models/OTP')
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken')
const {sendOtpEmail}=require('../utils/email');

const generateToken=(id,role)=>{
    return jwt.sign({id,role},process.env.JWT_SECRET,{expiresIn:'7d'})
}

//Register User

exports.register=async(req,res)=>{
    const {name,email,password}=req.body;

    let userExists=await User.findOne({email});
    if(userExists){
        return res.status(400).json({message:"User Already Exists"});
    }

    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);

    try{
        const user=await User.create({name,email,password:hashedPassword,role:'user',isVerified:'false'});
        // await user.save();
        // 

        const otp=Math.floor(100000+Math.random()*900000).toString();
        console.log(`OTP for ${email} is ${otp}`);

        await OTP.create({email,otp,action:'account_verification'})

        await sendOtpEmail(email,otp,'account_verification')

        res.status(201).json({
            status:200,
            message:"User Registered Successfully,Please check your email for otp to verify your account",
            email:user.email
        });



    } catch(err){
        console.log(err);
        res.status(400).json({message:"Server Error"});
    }
};

//Login User 

exports.login=async(req,res)=>{

    const {email,password}=req.body;

    let user=await User.findOne({email});
    if(!user){
        return res.status(400).json({error:"Invalid Credentials,Please Sign Up first"});
    }

    const isMatch=await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(400).json({error:"Invalid Credentials,Enter Correct Password"})
    }

    if(!user.isVerified && user.role==='admin'){

        const otp=Math.floor(100000+Math.random()*900000).toString();
        await  OTP.deleteMany({email,action:'account_verification'});
        

        await OTP.create({email,otp,action:'account_verification'})

        await sendOtpEmail(email,otp,'account_verification')

        res.status(400).json({error:"Account not verified Please check your email for otp to verify your account",
        });

    }

    res.status(200).json({
        message:"Login Successful",
        status:200,

            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            token:generateToken(user._id,user.role)
        
    });
}

//Verify OTP
exports.verifyOtp = async (req,res)=>{
    const {email,otp}=req.body;
    const otpRecord = await OTP.findOne({email,otp,action:'account_verification'});

    if(!otpRecord){
        return res.status(400).json({error:'Invalid or expired OTP'});
    }

    const user = await User.findOneAndUpdate({email},{isVerified:true});
    await OTP.deleteMany({email,action:'account_verification'});

    res.status(200).json({
        status:200,
        message:'Account verified successfully',
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        token:generateToken(user._id,user.role)

    });
}
