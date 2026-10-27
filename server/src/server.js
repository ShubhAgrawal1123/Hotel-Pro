import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const port = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy server/.env.example to server/.env and configure it.');
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro');
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`HotelPro API listening on http://localhost:${port}/api`));
} catch (err) {
  console.error('Unable to connect to MongoDB:', err.message);
  process.exit(1);
}
