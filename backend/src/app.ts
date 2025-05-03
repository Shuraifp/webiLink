import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import planRoutes from './routes/planRoutes';
import roomRoutes from './routes/roomRoutes';
import zegoRoutes from './routes/zegoRoutes';
// import subscriptionRoutes from './routes/subscriptionRoute';

dotenv.config();

const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL!],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use(express.json());
app.use(cors({
  origin:[process.env.FRONTEND_URL!],
  credentials:true
}));
app.use(cookieParser())

app.use('/api/zego', zegoRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/rooms', roomRoutes);
// app.use('/api/subscription', subscriptionRoutes);

app.use(errorHandler);

