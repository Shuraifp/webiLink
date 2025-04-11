import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler';
import dotenv from 'dotenv';
import setupSocket from './socket/index'

dotenv.config();

// Routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import planRoutes from './routes/planRoutes';
import roomRoutes from './routes/roomRoutes';


const app = express();
export const server = http.createServer(app);
const io = new Server(server, {
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

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/rooms', roomRoutes);

app.use(errorHandler);


// Socket.io setup

setupSocket(io);
