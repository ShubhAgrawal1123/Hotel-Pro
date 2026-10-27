import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ['Standard', 'Deluxe', 'Suite'], required: true },
  description: { type: String, default: '' },
  capacity: { type: Number, min: 1, default: 2 },
  price: { type: Number, min: 0, required: true },
  image: { type: String, default: '' },
  status: { type: String, enum: ['Available', 'Maintenance'], default: 'Available' }
}, { timestamps: true });
export default mongoose.model('Room', roomSchema);
