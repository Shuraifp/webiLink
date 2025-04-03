import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'

// Routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import planRoutes from './routes/planRoutes';


export const app = express();
app.use(express.json());
app.use(cors({
  origin:['http://localhost:3000'],
  credentials:true
}));
app.use(cookieParser())

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/plans', planRoutes)