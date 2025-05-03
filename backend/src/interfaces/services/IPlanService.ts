import { Request } from "express";
import { IPlan } from "../../models/PlanModel";
import { Stripe } from "stripe";
import { IUserPlan } from "../../models/UserPlanModel";

export interface IPlanService {
  createPlan(data: Partial<IPlan>): Promise<IPlan>;
  listActivePlans(): Promise<IPlan[]>;
  updatePlan(planId: string, data: Partial<IPlan>): Promise<IPlan | null>;
  makeSubscription(userId: string, priceId: string, planId: string): Promise<string>;
  handleWebhook(event: Stripe.Event): Promise<void>;
  getUserPlan(req: Request): Promise<IUserPlan>;
}