const Event = require('../models/Event');

// Controller functions for handling event-related operations
const getAllEvents = async (req, res) => {
    try {
        
        const filter={};
        if(req.query.category){
            filter.category=req.query.category;
        }
        if(req.query.date){
            filter.date={$gte:new Date(req.query.date)};
        }
        if(req.query.location){
            filter.location=req.query.location;
        }

        const events = await Event.find(filter);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;
    try {
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEvent = async (req, res) => {
    const { title, description, date, location, category, totalSeats, ticketPrice, imageUrl } = req.body;
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl
        }, { new: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };