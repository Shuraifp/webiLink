import express from 'express';
import authRoutes from './routes/authRoutes';
import cors from 'cors';
import cookieParser from 'cookie-parser'


export const app = express();
app.use(express.json());
app.use(cors({
  origin:['http://localhost:3000'],
  credentials:true
}));
app.use(cookieParser())

app.use('/api/auth', authRoutes);