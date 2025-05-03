// import { inject, injectable } from "inversify";
import ISubscriptionService from "../interfaces/services/subscription.service";
import ISubscriptionRepository from "../interfaces/repositories/subscription.repository";
import { ISubscription, ISubscriptionModel, IUserSubscriptionModel } from "../types/user";
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/types";
import stripe from "../config/stripe";
import { Request } from "express";
import Stripe from "stripe";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import IUserSubsRepository from "../interfaces/repositories/user.subscription.repository";
import IUserRepository from "../interfaces/repositories/user.repository";

// @injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    private _subscriptionRepository: ISubscriptionRepository,
    private _userSubsRepository: IUserSubsRepository,
    private _userRepository: IUserRepository
  ) { };
  async createSubscription(data: ISubscription): Promise<ISubscriptionModel> {
    const subscription = await this._subscriptionRepository.addSubscription(data);
    if (!subscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't add new subscription");
    };
    return subscription;
  };

  async getSubscriptions(): Promise<ISubscriptionModel[]> {
    const subscriptions = await this._subscriptionRepository.findAll();
    if (!subscriptions) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find subscriptions");
    }
    return subscriptions
  };

  async editSubscription(subId: string, data: Partial<ISubscription>): Promise<ISubscription> {
    const updatedSubscription = await this._subscriptionRepository.update(subId, data);
    if (!updatedSubscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't update the subscription");
    }
    return updatedSubscription;
  };

  async getActiveSubscriptions(): Promise<ISubscription[]> {
    const activeSubs = await this._subscriptionRepository.findAll({ isActive: true });
    if (!activeSubs) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't get subscriptions");
    };

    return activeSubs;
  };

  async makeSubscription(req: Request, priceId: string, subId: string): Promise<string> {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.userId!;

    const subscription = await this._subscriptionRepository.findOne({ stripePriceId: priceId });
    if (!subscription) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Cant' find the choosed subscription");
    };

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
        subscriptionId: subId
      }
    });
    if (session.url) {
      const session_url = session.url;
      return session_url;
    } else {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Something went wrong");
    };

  };

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event);
      // case 'invoice.payment_succeeded':
      //   return handleInvoicePaymentSucceeded(event);
      // case 'invoice.payment_failed':
      //   return handleInvoicePaymentFailed(event);
      // case 'customer.subscription.updated':
      //   return handleCustomerSubscriptionUpdated(event);
      // case 'customer.subscription.deleted':
      //   return handleCustomerSubscriptionDeleted(event);
      default:
        throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, `Unhandled event type: ${event.type}`);
    };
  };

  async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, subscriptionId } = session.metadata!;

    if (session.subscription) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ['latest_invoice', 'customer'] }
      ) as Stripe.Subscription;

      await this._userSubsRepository.createSub({
        userId,
        subscriptionId,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(((stripeSubscription as any).current_period_start ?? Date.now() / 1000) * 1000),
        currentPeriodEnd: new Date(((stripeSubscription as any).current_period_end ?? Date.now() / 1000) * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      });

      await this._userRepository.update(userId, {
        subscriptionId
      });
    };
  };

  async getUserSubscription(req: Request): Promise<IUserSubscriptionModel> {
    const { user } = req as AuthenticatedRequest;
    const userId = user?.userId!;
    const userSub = await this._userSubsRepository.findUserSubscription(userId);
    if (!userSub) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Can't find your subscription");
    }
    return userSub;
  };

};