import { Router } from 'express';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
const active = ['Confirmed', 'Checked In'];
router.get('/', protect, async (req, res, next) => {
  try {
    const q = req.user.role === 'admin' ? {} : { guest: req.user._id };
    if (req.query.search) {
      const s = String(req.query.search);
      q.bookingCode = new RegExp(s, 'i');
    }
    res.json(await Booking.find(q).populate('guest', 'name email phone').populate('room', 'number type price').sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});
router.post('/', protect, async (req, res, next) => {
  try {
    const { room: roomId, checkIn, checkOut, guests = 1 } = req.body;
    const start = new Date(checkIn), end = new Date(checkOut);
    if (!checkIn || !checkOut || Number.isNaN(+start) || Number.isNaN(+end) || end <= start)
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    const room = await Room.findById(roomId);
    if (!room || room.status !== 'Available') return res.status(400).json({ message: 'Room is unavailable' });
    if (!Number.isInteger(Number(guests)) || Number(guests) < 1 || Number(guests) > room.capacity)
      return res.status(400).json({ message: `Guest count must be between 1 and ${room.capacity}` });
    const overlap = await Booking.exists({
      room: roomId, status: { $in: active }, checkIn: { $lt: end }, checkOut: { $gt: start }
    });
    if (overlap) return res.status(409).json({ message: 'Room is already booked for those dates' });
    const nights = Math.ceil((end - start) / 86400000);
    const booking = await Booking.create({
      bookingCode: `HP-${Date.now().toString().slice(-8)}`,
      guest: req.user._id, room: room._id, checkIn: start, checkOut: end,
      guests: Number(guests), total: nights * room.price, status: 'Confirmed'
    });
    res.status(201).json(await booking.populate([{ path: 'guest', select: 'name email phone' }, { path: 'room', select: 'number type price' }]));
  } catch (e) { next(e); }
});
router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const status = req.body.status;
    if (req.user.role !== 'admin') {
      if (String(booking.guest) !== String(req.user._id) || status !== 'Cancelled')
        return res.status(403).json({ message: 'You may only cancel your own booking' });
      if (!['Confirmed'].includes(booking.status)) return res.status(400).json({ message: 'This booking can no longer be cancelled' });
    } else if (!['Confirmed', 'Checked In', 'Checked Out', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    booking.status = status;
    await booking.save();
    res.json(await booking.populate([{ path: 'guest', select: 'name email phone' }, { path: 'room', select: 'number type price' }]));
  } catch (e) { next(e); }
});
export default router;
