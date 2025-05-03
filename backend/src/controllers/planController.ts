import { NextFunction, Request, Response } from "express";
import { IPlanController } from "../interfaces/controllers/IPlanController";
import { IPlanService } from "../interfaces/services/IPlanService";
import { NotFoundError, InternalServerError, BadRequestError } from "../utils/errors";
import { HttpStatus, successResponse } from "../types/type";
import stripe, { Stripe } from "stripe";

export class PlanController implements IPlanController {
  constructor(private _planService: IPlanService) {}

  async fetchActivePlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await this._planService.listActivePlans();
      if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
      res.status(HttpStatus.OK).json(successResponse("Active plans fetched successfully", plans));
    } catch (error) {
      next(error);
    }
  }

  async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedFeatures = JSON.parse(req.body.features);
      const planData: Partial<IPlan> = {
        name: req.body.name,
        description: req.body.description,
        features: parsedFeatures,
        price: req.body.price,
        billingCycle: req.body.billingCycle,
        stripePriceId: req.body.stripePriceId,
        stripeProductId: req.body.stripeProductId,
        isArchived: false,
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
      const parsedFeatures = JSON.parse(req.body.features);
      const planData: Partial<IPlan> = {
        name: req.body.name,
        description: req.body.description,
        features: parsedFeatures,
        price: req.body.price,
        billingCycle: req.body.billingCycle,
        stripePriceId: req.body.stripePriceId,
        stripeProductId: req.body.stripeProductId,
        isArchived: req.body.isArchived,
      };
      const updatedPlan = await this._planService.updatePlan(planId, planData);
      if (!updatedPlan) throw new InternalServerError("Failed to update plan");
      res.status(HttpStatus.OK).json(successResponse("Plan updated successfully", updatedPlan));
    } catch (error) {
      next(error);
    }
  }

  async makeSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priceId, planId, userId } = req.body;
      const sessionUrl = await this._planService.makeSubscription(userId, priceId, planId);
      res.status(HttpStatus.OK).json(successResponse("Subscription session created", { url: sessionUrl }));
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET_KEY!
      );
      await this._planService.handleWebhook(event);
      res.status(HttpStatus.OK).json(successResponse("Webhook received", { received: true }));
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(HttpStatus.BAD_REQUEST).json({ error: `Webhook Error: ${err.message}` });
    }
  }

  async getUserPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userPlan = await this._planService.getUserPlan(req);
      if (!userPlan) throw new NotFoundError("User plan not found");
      res.status(HttpStatus.OK).json(successResponse("User plan fetched successfully", userPlan));
    } catch (error) {
      next(error);
    }
  }
}