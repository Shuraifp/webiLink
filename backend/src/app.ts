import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import planRoutes from './routes/planRoutes';


export const app = express();
export const io = new Server()

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

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});
