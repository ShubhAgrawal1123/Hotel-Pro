import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro';
await mongoose.connect(uri);
try {
  await Promise.all([User.deleteMany({}), Room.deleteMany({}), Booking.deleteMany({})]);
  const admin = await User.create({ name: 'HotelPro Admin', email: 'admin@hotelpro.local', password: await bcrypt.hash('HotelPro123!', 12), role: 'admin', phone: '+91 90000 00001' });
  const guests = await User.insertMany([
    { name: 'Aarav Mehta', email: 'aarav@example.com', password: await bcrypt.hash('GuestPass123!', 10), phone: '+91 90000 00002', role: 'guest' },
    { name: 'Ananya Shah', email: 'ananya@example.com', password: await bcrypt.hash('GuestPass123!', 10), phone: '+91 90000 00003', role: 'guest' },
    { name: 'Kabir Joshi', email: 'kabir@example.com', password: await bcrypt.hash('GuestPass123!', 10), phone: '+91 90000 00004,', role: 'guest' },
    { name: 'Diya Kapoor', email: 'diya@example.com', password: await bcrypt.hash('GuestPass123!', 10), phone: '+91 90000 00005', role: 'guest' },
    { name: 'Vivaan Rao', email: 'vivaan@example.com', password: await bcrypt.hash('GuestPass123!', 10), phone: '+91 90000 00006', role: 'guest' }
  ]);
  const rooms = await Room.insertMany([
    { number: '101', type: 'Standard', description: 'Comfortable city-view room with a queen bed.', capacity: 2, price: 2800, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900', status: 'Available' },
    { number: '102', type: 'Standard', description: 'Calm, minimal room for a restful stay.', capacity: 2, price: 3000, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900', status: 'Available' },
    { number: '201', type: 'Deluxe', description: 'Spacious deluxe room with lounge seating.', capacity: 3, price: 4500, image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900', status: 'Available' },
    { number: '202', type: 'Deluxe', description: 'Warm interiors and premium amenities.', capacity: 3, price: 4800, image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=900', status: 'Available' },
    { number: '301', type: 'Suite', description: 'Signature suite with separate living space.', capacity: 4, price: 8500, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900', status: 'Available' },
    { number: '302', type: 'Suite', description: 'Premium suite with panoramic windows.', capacity: 4, price: 9200, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900', status: 'Maintenance' }
  ]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = n => new Date(today.getTime() + n * 86400000);
  const data = [
    [0,0,-2,1,'Checked Out'], [1,2,0,2,'Checked In'], [2,3,1,2,'Confirmed'],
    [3,4,2,3,'Confirmed'], [4,1,3,2,'Confirmed'], [0,5,4,2,'Confirmed'],
    [1,0,6,1,'Cancelled'], [2,2,7,2,'Confirmed']
  ];
  await Booking.insertMany(data.map(([g,r,offset,nights, status], i) => ({
    bookingCode: `HP-DEMO-${1001+i}`, guest: guests[g]._id, room: rooms[r]._id,
    checkIn: day(offset), checkOut: day(offset + nights), guests: Math.min(2, rooms[r].capacity),
    total: nights * rooms[r].price, status
  })));
  console.log(`Seed complete: admin ${admin.email}, ${rooms.length} rooms, ${guests.length} guests, 8 bookings.`);
} finally { await mongoose.disconnect(); }
