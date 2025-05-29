import cron from "node-cron";
import { PlanService } from "../services/planService";
import { PlanRepository } from "../repositories/planRepository";
import { UserPlanRepository } from "../repositories/userPlanRepository";
import { UserRepository } from "../repositories/userRepository";
import { PaymentRepository } from "../repositories/paymentRepository";
import PlanModel from "../models/PlanModel";
import UserPlanModel from "../models/UserPlanModel";
import UserModel from "../models/userModel";
import PaymentModel from "../models/PaymentModel";
import logger from "../utils/logger";
import { RoomRepository } from "../repositories/RoomRepository";
import RoomModel from "../models/RoomModel";

const planRepository = new PlanRepository(PlanModel);
const userPlanRepository = new UserPlanRepository(UserPlanModel);
const userRepository = new UserRepository(UserModel);
const paymentRepository = new PaymentRepository(PaymentModel);
const roomRepository = new RoomRepository(RoomModel);
const planService = new PlanService(
  planRepository,
  userPlanRepository,
  userRepository,
  paymentRepository,
  roomRepository
);

cron.schedule("0 * * * *", async () => {
  try {
    logger.info("Cron: Starting subscription status sync");
    await planService.syncSubscriptionStatuses();
    logger.info("Cron: Subscription status sync completed");
  } catch (error) {
    logger.error(`Cron: Failed to run subscription status sync: ${error}`);
  }
});

logger.info("Cron job scheduled for subscription status sync");
