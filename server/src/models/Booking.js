import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, unique: true, required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, min: 1, default: 1 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled'], default: 'Confirmed' }
}, { timestamps: true });
export default mongoose.model('Booking', bookingSchema);
