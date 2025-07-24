import { IPlan } from "../../models/PlanModel";
import { Stripe } from "stripe";
import { IUserPlan } from "../../models/UserPlanModel";
import { PlanDTO } from "../../dto/planDTO";

export interface IPlanService {
  createPlan(data: Partial<IPlan>): Promise<PlanDTO>;
  listActivePlans(): Promise<PlanDTO[]>;
  listArchivedPlans(): Promise<PlanDTO[]>;
  archivePlan(planId: string): Promise<PlanDTO | null>;
  restorePlan(planId: string): Promise<PlanDTO | null>;
  updatePlan(planId: string, data: Partial<IPlan>): Promise<PlanDTO | null>;
  makeSubscription(
    userId: string,
    priceId: string,
    planId: string
  ): Promise<string>;
  handleWebhook(event: Stripe.Event): Promise<void>;
  handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void>;
  getUserPlan(
    userId: string
  ): Promise<{ userPlan: IUserPlan; plan: PlanDTO } | null>;
  getPendingPlan(userId: string): Promise<{ userPlan: IUserPlan; plan: PlanDTO } | null>;
  retryPayment(userId: string): Promise<string>;
  cancelPendingSubscription(userId: string): Promise<void>;
  cancelActiveSubscription(userId: string): Promise<void>;
  getHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<{
    data: IUserPlan[];
    totalItems: number;
    totalPages: number;
  }>;
}
