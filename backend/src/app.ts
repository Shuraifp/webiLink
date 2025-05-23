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
import userRoutes from './routes/userRoutes';
import planRoutes from './routes/planRoutes';
import roomRoutes from './routes/roomRoutes';
import chatRoomRoutes from './routes/chatRoomRoutes';
import meetingRoutes from './routes/meetingRoutes';
import recordingsRouter from './routes/recordings';
import { PlanController } from "./controllers/planController"; 
import { PlanService } from "./services/planService"; 
import { PlanRepository } from "./repositories/planRepository";
import { UserPlanRepository } from "./repositories/userPlanRepository";
import { UserRepository } from "./repositories/userRepository";
import PlanModel from "./models/PlanModel";
import UserPlanModel from "./models/UserPlanModel";
import UserModel from "./models/userModel";
import { PaymentRepository } from './repositories/paymentRepository';
import PaymentModel from './models/PaymentModel';

dotenv.config();

const planRepository = new PlanRepository(PlanModel);
const userPlanRepository = new UserPlanRepository(UserPlanModel);
const userRepository = new UserRepository(UserModel);
const paymentRepository = new PaymentRepository(PaymentModel)
const planService = new PlanService(planRepository, userPlanRepository, userRepository, paymentRepository);
const planController = new PlanController(planService);

const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL!],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.post(
  "/api/plans/webhook",
  express.raw({ type: "application/json" }), 
  planController.handleWebhook.bind(planController)
);

app.use(express.json());
app.use(cors({
  origin:[process.env.FRONTEND_URL!],
  credentials:true
}));
app.use(cookieParser())

app.use('/api/zego', chatRoomRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/meetings', meetingRoutes);
app.use("/api/recordings", recordingsRouter);

app.use(errorHandler);

