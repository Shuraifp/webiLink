import { Request } from "express";
import { IPlanService } from "../interfaces/services/IPlanService";
import { IPlanRepository } from "../interfaces/repositories/IPlanRepository";
import { IUserPlanRepository } from "../interfaces/repositories/IUserPlanRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IPlan } from "../models/PlanModel";
import { NotFoundError, InternalServerError, BadRequestError } from "../utils/errors";
import stripe from "../config/stripe";
import { Stripe } from "stripe";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { IUserPlan } from "../models/UserPlanModel";
import { Types } from "mongoose";

export class PlanService implements IPlanService {
  constructor(
    private _planRepository: IPlanRepository,
    private _userPlanRepository: IUserPlanRepository,
    private _userRepository: IUserRepository
  ) {}

  async createPlan(data: Partial<IPlan>): Promise<IPlan> {
    try {
      const plan = await this._planRepository.create(data);
      if (!plan) throw new InternalServerError("Failed to create plan");
      return plan;
    } catch (error) {
      throw new InternalServerError("An error occurred while creating the plan");
    }
  }

  async listActivePlans(): Promise<IPlan[]> {
    try {
      const plans = await this._planRepository.listActivePlans();
      if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
      return plans;
    } catch (error) {
      throw new InternalServerError("An error occurred while fetching plans");
    }
  }

  async updatePlan(planId: string, data: Partial<IPlan>): Promise<IPlan | null> {
    try {
      const updatedPlan = await this._planRepository.update(new Types.ObjectId(planId), data);
      if (!updatedPlan) throw new NotFoundError("Plan not found");
      return updatedPlan;
    } catch (error) {
      throw new InternalServerError("An error occurred while updating the plan");
    }
  }

  async makeSubscription(userId: string, priceId: string, planId: string): Promise<string> {
    try {
      const plan = await this._planRepository.findOne({ stripePriceId: priceId });
      if (!plan) throw new NotFoundError("Plan not found");

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
        client_reference_id: userId,
        metadata: {
          userId,
          planId,
        },
      });

      if (!session.url) throw new InternalServerError("Failed to create checkout session");
      return session.url;
    } catch (error) {
      throw new InternalServerError("An error occurred while creating the subscription");
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event);
          break;
        default:
          throw new BadRequestError(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      throw new InternalServerError("An error occurred while handling the webhook");
    }
  }

  async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, planId } = session.metadata!;

      if (!session.subscription) throw new InternalServerError("No subscription found in session");

      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ['latest_invoice', 'customer'] }
      ) as Stripe.Subscription;

      await this._userPlanRepository.create({
        userId: new Types.ObjectId(userId),
        planId: new Types.ObjectId(planId),
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      });

      await this._userRepository.update(userId, { planId });
    } catch (error) {
      throw new InternalServerError("An error occurred while processing checkout session");
    }
  }

  async getUserPlan(req: Request): Promise<IUserPlan> {
    try {
      const { user } = req as AuthenticatedRequest;
      const userId = user?.userId!;
      const userPlan = await this._userPlanRepository.findUserPlan(userId);
      if (!userPlan) throw new NotFoundError("User plan not found");
      return userPlan;
    } catch (error) {
      throw new InternalServerError("An error occurred while fetching user plan");
    }
  }
}