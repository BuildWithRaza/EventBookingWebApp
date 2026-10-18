
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Bookings');

dotenv.config();

const users = [
    {
        name: 'Admin User',
        email: 'admin@eventora.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
    },
    {
        name: 'Demo User',
        email: 'user@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    },
    {
        name: 'Alice Smith',
        email: 'alice@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    },
    {
        name: 'Bob Johnson',
        email: 'bob@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    },
    {
        name: 'Charlie Dave',
        email: 'charlie@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    },
    {
        name: 'Diana Prince',
        email: 'diana@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    },
    {
        name: 'Ethan Hunt',
        email: 'ethan@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    },
    {
        name: 'Fiona Gallagher',
        email: 'fiona@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    },
    {
        name: 'George Miller',
        email: 'george@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    },
    {
        name: 'Hannah Montana',
        email: 'hannah@eventora.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    }
];

const events = [
    {
        title: 'React & Node.js Developer Retreat',
        description:
            'Join us for a 3-day deep dive into modern full-stack web development. Perfect for developers looking to take their skills to the next level.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Silicon Valley Innovation Center, CA',
        category: 'Technology',
        totalSeats: 200,
        ticketPrice: 0,
        imageUrl:
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Neon Nights EDM Festival',
        description:
            'Experience an unforgettable night of EDM, techno, and dazzling light shows with top DJs from around the globe.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'Grand Arena, New York',
        category: 'Music',
        totalSeats: 500,
        ticketPrice: 1500,
        imageUrl:
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Global Leaders Business Summit',
        description:
            'A premium gathering of CEOs, founders, and investors discussing the future of global commerce and AI integration.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'The Ritz-Carlton, London',
        category: 'Business',
        totalSeats: 150,
        ticketPrice: 5000,
        imageUrl:
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Modern Art Expo 2024',
        description:
            'Discover breathtaking contemporary and modern arts from underground and trending artists this season.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Downtown Art Museum',
        category: 'Art',
        totalSeats: 300,
        ticketPrice: 200,
        imageUrl:
            'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch & Pitch Competition',
        description:
            'Watch 25 startups pitch for 1 million dollars in seed funding. Great networking for entrepreneurs and angel investors.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Convention Center, Miami',
        category: 'Business',
        totalSeats: 250,
        ticketPrice: 100,
        imageUrl:
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description:
            'A purely technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute processing.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'Tech Hub, Seattle',
        category: 'Technology',
        totalSeats: 100,
        ticketPrice: 600,
        imageUrl:
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI ||
            'mongodb://localhost:27017/eventora'
        );

        console.log('MongoDB connected successfully.');

        // Delete bookings first to avoid orphaned references.
        await Booking.deleteMany({});
        await Event.deleteMany({});
        await User.deleteMany({});

        console.log('Existing data cleared.');

        // Hash passwords before inserting users.
        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10)
            }))
        );

        const createdUsers = await User.insertMany(hashedUsers);

        const adminUser = createdUsers.find(
            (user) => user.role === 'admin'
        );

        const normalUsers = createdUsers.filter(
            (user) => user.role === 'user'
        );

        console.log(`Created ${createdUsers.length} users.`);

        // Create events with the admin as their creator.
        const eventsWithAdmin = events.map((event) => ({
            ...event,
            availableSeats: event.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);

        console.log(`Created ${createdEvents.length} events.`);

        // Generate sample bookings.
        const bookingsData = [];

        // Track confirmed bookings for each event.
        const confirmedCounts = new Map();

        for (const event of createdEvents) {
            const randomCount = Math.floor(Math.random() * 4) + 3;

            const shuffledUsers = [...normalUsers].sort(
                () => Math.random() - 0.5
            );

            const selectedUsers = shuffledUsers.slice(0, randomCount);

            let confirmedCount = 0;

            for (const user of selectedUsers) {
                const statuses = [
                    'pending',
                    'confirmed',
                    'cancelled'
                ];

                const status =
                    statuses[Math.floor(Math.random() * statuses.length)];

                // Payment status must match the Booking schema enum.
                let paymentStatus = 'unpaid';

                if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                } else if (
                    status === 'confirmed' &&
                    Math.random() > 0.1
                ) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    user: user._id,
                    event: event._id,
                    status,
                    paymentStatus,
                    amount: event.ticketPrice
                });

                if (status === 'confirmed') {
                    confirmedCount++;
                }
            }

            confirmedCounts.set(
                event._id.toString(),
                confirmedCount
            );
        }

        // Insert bookings using the exact schema field names.
        await Booking.insertMany(bookingsData);

        // Update seat availability after counting confirmed bookings.
        for (const event of createdEvents) {
            const confirmedCount =
                confirmedCounts.get(event._id.toString()) || 0;

            await Event.updateOne(
                { _id: event._id },
                {
                    $set: {
                        availableSeats: Math.max(
                            0,
                            event.totalSeats - confirmedCount
                        )
                    }
                }
            );
        }

        console.log(`Created ${bookingsData.length} bookings.`);

        console.log('\nDatabase seeded successfully!');
        console.log('-----------------------------------');
        console.log('Admin Email: admin@eventora.com');
        console.log('User Email:  user@eventora.com');
        console.log('Password for all users: password123');
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase();