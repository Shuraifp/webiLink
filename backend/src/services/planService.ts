import { IPlanService } from "../interfaces/services/IPlanService";
import { IPlanRepository } from "../interfaces/repositories/IPlanRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IPlan } from "../models/PlanModel";
import {
  NotFoundError,
  InternalServerError,
  BadRequestError,
} from "../utils/errors";
import stripe from "../config/stripe";
import { Stripe } from "stripe";
import { IUserPlan, PlanStatus } from "../models/UserPlanModel";
import { Types } from "mongoose";
import { IUserPlanRepository } from "../interfaces/repositories/IUserplanRepository";

export class PlanService implements IPlanService {
  constructor(
    private _planRepository: IPlanRepository,
    private _userPlanRepository: IUserPlanRepository,
    private _userRepository: IUserRepository
  ) {}

  async createPlan(data: Partial<IPlan>): Promise<IPlan> {
    try {
      if (
        !data.name ||
        data.price == null ||
        data.price < 0 ||
        !data.billingCycle ||
        !data.billingCycle.interval
      ) {
        throw new BadRequestError("Invalid plan data");
      }

      if (
        data.billingCycle.interval !== "lifetime" &&
        (data.billingCycle.frequency == null ||
          data.billingCycle.frequency <= 0)
      ) {
        throw new BadRequestError(
          "Frequency must be greater than 0 for non-lifetime plans"
        );
      }

      let stripeProductId = "";
      let stripePriceId = "";

      if (data.price > 0) {
        const product = await stripe.products.create({
          name: data.name,
          description: data.description || undefined,
        });
        // const response = await fetch(
        //   "https://api.exchangerate-api.com/v4/latest/INR"
        // );
        // const exchangeRate = response.rates.USD;
        const exchangeRate = 0.012;
        const priceInUsd = data.price * exchangeRate;

        const priceData: Stripe.PriceCreateParams = {
          product: product.id,
          unit_amount: Math.round(priceInUsd * 100),
          currency: "usd",
        };

        if (data.billingCycle.interval !== "lifetime") {
          priceData.recurring = {
            interval: data.billingCycle.interval,
            interval_count: data.billingCycle.frequency,
          };
        }

        const price = await stripe.prices.create(priceData);
        stripeProductId = product.id;
        stripePriceId = price.id;
      }

      const planData = {
        ...data,
        stripeProductId,
        stripePriceId,
        isArchived: data.isArchived || false,
      };

      const plan = await this._planRepository.create(planData);
      if (!plan) throw new InternalServerError("Failed to create plan");
      return plan;
    } catch (error) {
      throw error instanceof BadRequestError
        ? error
        : new InternalServerError("An error occurred while creating the plan");
    }
  }

  async listActivePlans(): Promise<IPlan[]> {
    try {
      const plans = await this._planRepository.listActivePlans();
      if (!plans || plans.length === 0)
        throw new NotFoundError("No active plans found");
      return plans;
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while fetching active plans");
    }
  }

  async listArchivedPlans(): Promise<IPlan[]> {
    try {
      const plans = await this._planRepository.listArchivedPlans();
      if (!plans || plans.length === 0)
        throw new NotFoundError("No active plans found");
      return plans;
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while fetching archived plans");
    }
  }

  async archivePlan(planId: string): Promise<IPlan | null> {
    try {
      const archivedPlan = await this._planRepository.archive(
        new Types.ObjectId(planId)
      );
      if (!archivedPlan)
        throw new InternalServerError("Failed to archive plan");
      return archivedPlan;
    } catch (error) {
      throw error instanceof InternalServerError
        ? error
        : new InternalServerError("An error occurred while archiving the plan");
    }
  }

  async restorePlan(planId: string): Promise<IPlan | null> {
    try {
      const updatedPlan = await this._planRepository.restore(
        new Types.ObjectId(planId)
      );
      if (!updatedPlan) throw new NotFoundError("Plan not found");
      return updatedPlan;
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while restoring the plan");
    }
  }

  async updatePlan(
    planId: string,
    data: Partial<IPlan>
  ): Promise<IPlan | null> {
    try {
      if (
        !data.name ||
        data.price == null ||
        data.price < 0 ||
        !data.billingCycle ||
        !data.billingCycle.interval
      ) {
        throw new BadRequestError("Invalid plan data");
      }

      if (
        data.billingCycle.interval !== "lifetime" &&
        (data.billingCycle.frequency == null ||
          data.billingCycle.frequency <= 0)
      ) {
        throw new BadRequestError(
          "Frequency must be greater than 0 for non-lifetime plans"
        );
      }

      const existingPlan = await this._planRepository.findById(planId);
      if (!existingPlan) throw new NotFoundError("Plan not found");

      let stripeProductId = existingPlan.stripeProductId || "";
      let stripePriceId = existingPlan.stripePriceId || "";

      if (data.price > 0) {
        if (stripeProductId) {
          await stripe.products.update(stripeProductId, {
            name: data.name,
            description: data.description || undefined,
          });
        } else {
          const product = await stripe.products.create({
            name: data.name,
            description: data.description || undefined,
          });
          stripeProductId = product.id;
        }

        if (
          data.price !== existingPlan.price ||
          data.billingCycle.interval !== existingPlan.billingCycle.interval ||
          data.billingCycle.frequency !== existingPlan.billingCycle.frequency
        ) {
          // const response = await fetch(
          //   "https://api.exchangerate-api.com/v4/latest/INR"
          // );
          // const exchangeRate = response.rates.USD;
          const exchangeRate = 0.012;
          const priceInUsd = data.price * exchangeRate;

          const priceData: Stripe.PriceCreateParams = {
            product: stripeProductId,
            unit_amount: Math.round(priceInUsd * 100),
            currency: "usd",
          };

          if (data.billingCycle.interval !== "lifetime") {
            priceData.recurring = {
              interval: data.billingCycle.interval,
              interval_count: data.billingCycle.frequency,
            };
          }

          const newPrice = await stripe.prices.create(priceData);
          stripePriceId = newPrice.id;

          if (existingPlan.stripePriceId) {
            await stripe.prices.update(existingPlan.stripePriceId, {
              active: false,
            });
          }
        }
      } else {
        stripeProductId = "";
        stripePriceId = "";
      }

      const planData = {
        ...data,
        stripeProductId,
        stripePriceId,
        isArchived: data.isArchived ?? existingPlan.isArchived,
      };

      const updatedPlan = await this._planRepository.update(planId, planData);
      if (!updatedPlan)
        throw new NotFoundError("Plan updation failed. try again!");
      return updatedPlan;
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while updating the plan");
    }
  }

  async makeSubscription(
    userId: string,
    priceId: string,
    planId: string
  ): Promise<string> {
    try {
      const plan = await this._planRepository.findByQuery({
        _id: planId,
      });
      if (!plan) throw new NotFoundError("Plan not found");

      if (plan.isArchived) throw new BadRequestError("Plan is archived");

      if (plan.price > 0 && plan.stripePriceId !== priceId) {
        throw new BadRequestError("Invalid price ID for this plan");
      }

      const user = await this._userRepository.findById(userId);
      if (!user) throw new NotFoundError("User not found");

      const existingUserPlan = await this._userPlanRepository.findUserPlan(
        userId
      );
      if (existingUserPlan && existingUserPlan.status === PlanStatus.ACTIVE) {
        if (existingUserPlan.planId.toString() === planId) {
          throw new BadRequestError(
            "You already have an active subscription to this plan"
          );
        }

        if (existingUserPlan.stripeSubscriptionId) {
          await stripe.subscriptions.update(
            existingUserPlan.stripeSubscriptionId,
            {
              cancel_at_period_end: true,
            }
          );
        }
      }

      const price = await stripe.prices.retrieve(priceId);
      if (!price.active) throw new BadRequestError("Price is inactive");

      const isRecurring = !!price.recurring;
      const checkoutMode = isRecurring ? "subscription" : "payment";

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId },
        });
        customerId = customer.id;
        await this._userRepository.update(userId, {
          stripeCustomerId: customerId,
        });
      } else {
        try {
          await stripe.customers.retrieve(customerId);
        } catch (error) {
          if (error) {
            const customer = await stripe.customers.create({
              email: user.email,
              metadata: { userId },
            });
            customerId = customer.id;
            await this._userRepository.update(userId, {
              stripeCustomerId: customerId,
            });
          }
        }
      }

      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId || undefined,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: checkoutMode,
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        client_reference_id: userId,
        metadata: {
          userId,
          planId,
          isOneTime: (!isRecurring).toString(),
        },
      });

      if (!session.url)
        throw new InternalServerError("Failed to create checkout session");
      return session.url;
    } catch (error) {
      if (error instanceof stripe.errors.StripeError) {
        throw new BadRequestError(`Stripe error: ${error.message}`);
      }
      throw error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
        ? error
        : new InternalServerError(
            "An error occurred while creating the subscription"
          );
    }
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event);
          break;
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await this.handleSubscriptionStatusChange(event);
          break;
        default:
          return;
      }
    } catch (error) {
      throw error instanceof BadRequestError ||
        error instanceof InternalServerError
        ? error
        : new InternalServerError(
            "An error occurred while handling the webhook"
          );
    }
  }

  async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, planId, isOneTime } = session.metadata || {};

      if (!userId || !planId) {
        throw new BadRequestError("Missing metadata in checkout session");
      }

      const plan = await this._planRepository.findById(planId);
      if (!plan) throw new NotFoundError("Plan not found");

      if (plan.price === 0) {
        await this._userRepository.update(userId, {
          planId: null,
          isPremium: false,
        });
        return;
      }

      const userPlanData: Partial<IUserPlan> = {
        userId: new Types.ObjectId(userId),
        planId: new Types.ObjectId(planId),
        status: PlanStatus.ACTIVE,
        currentPeriodStart: new Date(),
      };

      let isPremium = plan.price > 0;

      if (isOneTime === "true") {
        if (!session.payment_intent) {
          throw new InternalServerError("No payment intent found in session");
        }
        userPlanData.currentPeriodEnd = null;
        userPlanData.stripePaymentIntentId = session.payment_intent as string;
      } else {
        if (!session.subscription) {
          throw new InternalServerError("No subscription found in session");
        }
        const stripeSubscription = (await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ["latest_invoice", "customer", "items.data.price.product"] }
        )) as Stripe.Subscription;
        userPlanData.stripeSubscriptionId = stripeSubscription.id;
        userPlanData.status = stripeSubscription.status as PlanStatus;
        userPlanData.currentPeriodStart = new Date(
          stripeSubscription.items.data[0].current_period_start * 1000
        );
        userPlanData.currentPeriodEnd = new Date(
          stripeSubscription.items.data[0].current_period_end * 1000
        );
        userPlanData.cancelAtPeriodEnd =
          stripeSubscription.cancel_at_period_end;
        isPremium =
          (stripeSubscription.status === PlanStatus.ACTIVE ||
            (stripeSubscription.status === PlanStatus.CANCELED &&
              stripeSubscription.cancel_at_period_end &&
              new Date(
                stripeSubscription.items.data[0].current_period_end * 1000
              ) > new Date())) &&
          plan.price > 0;
      }

      const existingUserPlan = await this._userPlanRepository.findUserPlan(
        userId
      );
      if (existingUserPlan) {
        await this._userPlanRepository.update(
          String(existingUserPlan._id),
          userPlanData
        );
      } else {
        await this._userPlanRepository.create(userPlanData);
      }

      const user = await this._userRepository.findById(userId);
      if (user && !user.stripeCustomerId && session.customer) {
        await this._userRepository.update(userId, {
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer.id,
        });
      }

      await this._userRepository.update(userId, {
        planId: new Types.ObjectId(planId),
        isPremium,
      });
    } catch (error: any) {
      if (error instanceof stripe.errors.StripeError) {
        throw new BadRequestError(`Stripe error: ${error.message}`);
      }
      throw error instanceof BadRequestError ||
        error instanceof InternalServerError
        ? error
        : new InternalServerError(
            `An error occurred while processing checkout session: ${error.message}`
          );
    }
  }

  async handleSubscriptionStatusChange(event: Stripe.Event): Promise<void> {
    try {
      const subscription = event.data.object as Stripe.Subscription;
      const userPlan = await this._userPlanRepository.findByQuery({
        stripeSubscriptionId: subscription.id,
      });

      if (!userPlan) {
        throw new NotFoundError("User plan not found for subscription");
      }

      const userId = userPlan.userId.toString();
      const planId = userPlan.planId.toString();
      const plan = await this._planRepository.findById(planId);
      if (!plan) throw new NotFoundError("Plan not found");

      const status = subscription.status as PlanStatus;
      const isPremium =
        (status === PlanStatus.ACTIVE ||
          (status === PlanStatus.CANCELED &&
            subscription.cancel_at_period_end &&
            new Date(subscription.items.data[0].current_period_end * 1000) > new Date())) &&
        plan.price > 0;

      const userPlanData: Partial<IUserPlan> = {
        status,
        currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };

      await this._userPlanRepository.update(String(userPlan._id), userPlanData);

      if (event.type === "customer.subscription.deleted") {
        await this._userRepository.update(userId, {
          planId: null,
          isPremium: false,
        });
        await this._userPlanRepository.update(userPlan._id.toString(), {
          status: PlanStatus.CANCELED
        })
      } else {
        await this._userRepository.update(userId, {
          isPremium,
        });
      }
    } catch (error: any) {
      if (error instanceof stripe.errors.StripeError) {
        throw new BadRequestError(`Stripe error: ${error.message}`);
      }
      throw error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
        ? error
        : new InternalServerError(
            `An error occurred while processing subscription status change: ${error.message}`
          );
    }
  }

  async getUserPlan(userId: string): Promise<{ userPlan: IUserPlan; plan: IPlan }> {
    try {
      const userPlan = await this._userPlanRepository.findUserPlan(userId);
      if (!userPlan) {
        throw new NotFoundError("No active plan found for user");
      }
  
      const plan = await this._planRepository.findById(userPlan.planId.toString());
      if (!plan) {
        throw new NotFoundError("Plan not found");
      }
  
      return { userPlan, plan };
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError("Failed to retrieve user plan");
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const userPlan = await this._userPlanRepository.findUserPlan(userId);
      if (!userPlan) {
        throw new NotFoundError("No active plan found for user");
      }
  
      if (!userPlan.stripeSubscriptionId) {
        throw new BadRequestError("No recurring subscription to cancel");
      }
  
      const subscription = await stripe.subscriptions.update(userPlan.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
  
      await this._userPlanRepository.update(userPlan._id.toString(), {
        status: subscription.status as PlanStatus,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError("Failed to cancel subscription");
    }
  }
}
