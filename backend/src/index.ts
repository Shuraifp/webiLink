import dotenv from 'dotenv';
import { app, io } from './app';
import connectDB from './config/db';

dotenv.config();

async function startServer() {
  await connectDB();
  const PORT = process.env.PORT || 8000;
  const IOPORT = Number(process.env.IOPORT || 8001);
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  io.listen(IOPORT);
}

startServer();