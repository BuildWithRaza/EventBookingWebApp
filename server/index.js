const express=require('express')
const cors=require('cors')
const dotenv=require('dotenv')
const mongoose=require('mongoose')
const authRoutes=require('./routes/auth');
const eventRoutes=require('./routes/event');
const bookingRoutes=require('./routes/booking');

dotenv.config();

const app=express()
app.use(cors())
app.use(express.json())

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/events',eventRoutes);
app.use('/api/bookings',bookingRoutes);

app.get('/',(req,res)=>{
    res.send('Hello World')
})

const port=Number(process.env.PORT) || 5000;

//Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB connected")
})
.catch((err)=>{console.log("Error Connecting to MongoDB : ",err)})

app.listen(port,()=>{
    console.log(`App is running on port ${port}`)
})