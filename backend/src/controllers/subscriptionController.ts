import { Request, Response, NextFunction } from "express";
import ISubscriptionController from "../interfaces/controllers/subscription.controller";
import ISubscriptionService from "../interfaces/services/subscription.service";
import { ISubscription } from "../types/user";
import { StatusCode } from "../types/types";
import { HttpResponse } from "../utils/http.response";
import stripe, { Stripe } from "stripe";

export class SubscriptionController implements ISubscriptionController {
  constructor(private _subscriptionService: ISubscriptionService) { };

  async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedFeatures = JSON.parse(req.body.features)
      const subscriptionData: ISubscription = {
        name: req.body.name,
        description: req.body.description,
        features: parsedFeatures,
        stripeProductId: req.body.stripeProductId,
        stripePriceId: req.body.stripePriceId,
        price: req.body.price,
        billingCycle: req.body.billingCycle,
        isActive: true
      };
      const newSubscription = await this._subscriptionService.createSubscription(subscriptionData);
      res.status(StatusCode.CREATED).json(HttpResponse.created(newSubscription, "Subscriptoin created."));
    } catch (error) {
      next(error);
    };
  };

  async getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscriptions = await this._subscriptionService.getSubscriptions();
      res.status(StatusCode.OK).json(HttpResponse.success(subscriptions));
    } catch (error) {
      next(error);
    };
  };

  async editSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subId = req.params.id;
      const parsedFeatures = JSON.parse(req.body.features)
      const subEditData: Partial<ISubscription> = {
        name: req.body.name,
        description: req.body.description,
        features: parsedFeatures,
        price: req.body.price,
        billingCycle: req.body.billingCycle,
        stripeProductId: req.body.stripeProductId,
        stripePriceId: req.body.stripePriceId,
        isActive: req.body.isActive
      };
      console.log(req.body, "this is rqboy");

      const subscriptions = await this._subscriptionService.editSubscription(subId, subEditData);
      res.status(StatusCode.OK).json(HttpResponse.success(subscriptions, "Subscription updated."));
    } catch (error) {
      next(error);
    };
  };

  async getActiveSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeSubs = await this._subscriptionService.getActiveSubscriptions();
      res.status(StatusCode.OK).json(HttpResponse.success(activeSubs));
    } catch (error) {
      next(error);
    };
  };

  async makeSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { priceId, subId } = req.body;
      const session_url = await this._subscriptionService.makeSubscription(req, priceId, subId);
      res.status(StatusCode.OK).json({ url: session_url });
    } catch (error) {
      next(error);
    };
  };

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("i am also working >>>>>");
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET_KEY!
      );

      await this._subscriptionService.handleWebhook(event);
      res.json({ received: true });
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  };

  async getUserSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userSub = await this._subscriptionService.getUserSubscription(req);
      res.status(StatusCode.OK).json(HttpResponse.success(userSub));
    } catch (error) {
      next(error);
    };
  };

};