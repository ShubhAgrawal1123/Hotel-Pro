import { Router } from 'express';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
router.get('/', protect, adminOnly, async (_req, res, next) => {
  try {
    const guests = await User.find({ role: 'guest' }).select('name email phone createdAt');
    const rows = await Promise.all(guests.map(async g => {
      const bookings = await Booking.find({ guest: g._id, status: { $ne: 'Cancelled' } }).populate('room', 'number');
      return { ...g.toObject(), bookingCount: bookings.length, totalSpending: bookings.reduce((sum, b) => sum + b.total, 0), bookings };
    }));
    res.json(rows);
  } catch (e) { next(e); }
});
export default router;
