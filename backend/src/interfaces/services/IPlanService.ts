import { IPlan } from "../../models/PlanModel";
import { Stripe } from "stripe";
import { IUserPlan } from "../../models/UserPlanModel";

export interface IPlanService {
  createPlan(data: Partial<IPlan>): Promise<IPlan>;
  listActivePlans(): Promise<IPlan[]>;
  listArchivedPlans(): Promise<IPlan[]>;
  archivePlan(planId: string): Promise<IPlan | null>;
  restorePlan(planId: string): Promise<IPlan | null>;
  updatePlan(planId: string, data: Partial<IPlan>): Promise<IPlan | null>;
  makeSubscription(
    userId: string,
    priceId: string,
    planId: string
  ): Promise<string>;
  handleWebhook(event: Stripe.Event): Promise<void>;
  handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void>;
  getUserPlan(
    userId: string
  ): Promise<{ userPlan: IUserPlan; plan: IPlan } | null>;
  getPendingPlan(userId: string): Promise<{ userPlan: IUserPlan; plan: IPlan } | null>;
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
