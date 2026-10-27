import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
const router = Router();
let settings = { hotelName: 'HotelPro Grand', email: 'hello@hotelpro.local', phone: '+91 731 400 1200', address: 'Indore, Madhya Pradesh, India', currency: 'INR', propertyType: 'Boutique Hotel', status: 'Operational' };
router.get('/', protect, (_req, res) => res.json(settings));
router.put('/', protect, adminOnly, (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});
export default router;
