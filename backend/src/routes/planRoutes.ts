import { Router } from "express";
import { PlanController } from "../controllers/planController";
import { PlanService } from "../services/planService";
import { PlanRepository } from "../repositories/planRepository";
import PlanModel from "../models/PlanModel";

const planModel = PlanModel
const planRepository = new PlanRepository(planModel)
const planService = new PlanService(planRepository)
const planController = new PlanController(planService)

const router = Router()

router.get('/', planController.fetchActivePlans.bind(planController))


export default router

