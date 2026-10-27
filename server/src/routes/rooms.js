import { Router } from 'express';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const { search = '', type = '', status = '' } = req.query;
    const q = {};
    if (search) q.$or = [{ number: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
    if (type) q.type = type;
    if (status) q.status = status;
    res.json(await Room.find(q).sort({ number: 1 }));
  } catch (e) { next(e); }
});
router.post('/', protect, adminOnly, async (req, res, next) => {
  try { res.status(201).json(await Room.create(req.body)); } catch (e) { next(e); }
});
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (e) { next(e); }
});
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (await Booking.exists({ room: req.params.id, status: { $nin: ['Cancelled', 'Checked Out'] } }))
      return res.status(409).json({ message: 'Room has active reservations and cannot be deleted' });
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (e) { next(e); }
});
export default router;
