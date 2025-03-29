import dotenv from 'dotenv';
import { app } from './app';
import connectDB from './config/db';

dotenv.config();

async function startServer() {
  await connectDB();
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();