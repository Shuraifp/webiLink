import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

// Routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import planRoutes from './routes/planRoutes';


const app = express();
export const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use(express.json());
app.use(cors({
  origin:['http://localhost:3000'],
  credentials:true
}));
app.use(cookieParser())

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/plans', planRoutes)

app.use(errorHandler);


// Socket.io setup

const emailToSocketIdMap = new Map<string, string>();
const socketIdToEmailMap = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('join-room', (data) => {
    console.log('User joined room', data);
    const { email, roomId } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    io.to(socket.id).emit('joined-room', { message: 'You have joined the room', roomId });
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});
