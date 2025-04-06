import dotenv from 'dotenv';
import { server } from './app';
import connectDB from './config/db';

dotenv.config();

async function startServer() {
  await connectDB();
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();