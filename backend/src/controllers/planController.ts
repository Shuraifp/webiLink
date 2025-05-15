import { NextFunction, Request, Response } from "express";
import { IPlanService } from "../interfaces/services/IPlanService";
import { NotFoundError } from "../utils/errors";
import { HttpStatus, successResponse } from "../types/type";
import stripe, { Stripe } from "stripe";
import { IPlan } from "../models/PlanModel";

export class PlanController {
  constructor(private _planService: IPlanService) {}

  async fetchActivePlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await this._planService.listActivePlans();
      res.status(HttpStatus.OK).json(successResponse("Active plans fetched successfully", plans));
    } catch (error) {
      next(error);
    }
  }

  async fetchArchivedPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await this._planService.listArchivedPlans();
      res.status(HttpStatus.OK).json(successResponse("Archived plans fetched successfully", plans));
    } catch (error) {
      next(error);
    }
  }

  async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, price, billingCycle, features, isArchived } = req.body;
      const planData: Partial<IPlan> = {
        name,
        description,
        features,
        price,
        billingCycle,
        isArchived: isArchived || false,
      };
      
      const newPlan = await this._planService.createPlan(planData);
      res.status(HttpStatus.CREATED).json(successResponse("Plan created successfully", newPlan));
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const { name, description, price, billingCycle, features, isArchived } = req.body;
      const planData: Partial<IPlan> = {
        name,
        description,
        features, 
        price,
        billingCycle,
        isArchived,
      };
      const updatedPlan = await this._planService.updatePlan(planId, planData);
      if (!updatedPlan) throw new NotFoundError("Plan not found");
      res.status(HttpStatus.OK).json(successResponse("Plan updated successfully", updatedPlan));
    } catch (error) {
      next(error);
    }
  }

  async archivePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const updatedPlan = await this._planService.archivePlan(planId);
      if (!updatedPlan) throw new NotFoundError("Plan not found");
      res.status(HttpStatus.OK).json(successResponse("Plan archived successfully", updatedPlan));
    } catch (error) {
      next(error);
    }
  }

  async restorePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const updatedPlan = await this._planService.restorePlan(planId);
      if (!updatedPlan) throw new NotFoundError("Plan not found");
      res.status(HttpStatus.OK).json(successResponse("Plan restored successfully", updatedPlan));
    } catch (error) {
      next(error);
    }
  }

  async makeSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { _id: userId } = req.user!
      const { priceId, planId } = req.body;
      const sessionUrl = await this._planService.makeSubscription(userId, priceId, planId);
      res.status(HttpStatus.OK).json(successResponse("Subscription session created", { url: sessionUrl }));
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      await this._planService.handleWebhook(event);
      res.status(HttpStatus.OK).json(successResponse("Webhook received", { received: true }));
    } catch (error) {
      next(error);
    }
  }

  async getUserPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;
      const data = await this._planService.getUserPlan(userId);
      res.status(HttpStatus.OK).json(successResponse("User plan retrieved", data));
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;
      await this._planService.cancelSubscription(userId);
      res.status(HttpStatus.OK).json(successResponse("Subscription canceled", null));
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id; 
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await this._planService.getHistory(userId,page,limit);
      res.status(HttpStatus.OK).json(successResponse("Subscription history fetched successfully", history));
    } catch (error) {
      next(error);
    }
  }
}