const express=require('express');
const router=express.Router();
const {protect,admin}=require('../middlewares/auth');
const {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent}=require('../controllers/eventController');

// Define routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);    

module.exports=router;