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
import { IPaymentRepository } from "../interfaces/repositories/IPaymentRepository";
import { IPayment } from "../models/PaymentModel";
import logger from "../utils/logger";

export class PlanService implements IPlanService {
  constructor(
    private _planRepository: IPlanRepository,
    private _userPlanRepository: IUserPlanRepository,
    private _userRepository: IUserRepository,
    private _paymentRepository: IPaymentRepository
  ) {}

  async createPlan(data: Partial<IPlan>): Promise<IPlan> {
    try {
      if (!data.name || data.price! < 0) {
        throw new BadRequestError("Invalid plan data");
      }

      let stripeProductId = "";
      let stripePriceId = "";

      if (data.price! > 0) {
        if (!data.billingCycle) {
          throw new BadRequestError("Invalid plan data");
        }
        if (
          data?.billingCycle?.frequency == null ||
          data.billingCycle.frequency <= 0
        ) {
          throw new BadRequestError(
            "Interval count must be greater than 0 for Premium plans"
          );
        }

        const product = await stripe.products.create({
          name: data.name,
          description: data.description || undefined,
        });
        // const response = await fetch(
        //   "https://api.exchangerate-api.com/v4/latest/INR"
        // );
        // const exchangeRate = response.rates.USD;
        const exchangeRate = 0.012;
        const priceInUsd = data.price! * exchangeRate;

        const priceData: Stripe.PriceCreateParams = {
          product: product.id,
          unit_amount: Math.round(priceInUsd * 100),
          currency: "usd",
        };

        priceData.recurring = {
          interval: data.billingCycle.interval,
          interval_count: data.billingCycle.frequency,
        };

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
        : new InternalServerError(
            "An error occurred while fetching active plans"
          );
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
        : new InternalServerError(
            "An error occurred while fetching archived plans"
          );
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
      if (!data.name || data.price! < 0 || !data.price) {
        throw new BadRequestError("Invalid plan data");
      }

      const existingPlan = await this._planRepository.findById(planId);
      if (!existingPlan) throw new NotFoundError("Plan not found");

      let stripeProductId = existingPlan.stripeProductId || "";
      let stripePriceId = existingPlan.stripePriceId || "";

      if (data.price > 0) {
        if (!data.billingCycle) {
          throw new BadRequestError("Invalid plan data");
        }
        if (
          data?.billingCycle?.frequency == null ||
          data.billingCycle.frequency <= 0
        ) {
          throw new BadRequestError(
            "Interval count must be greater than 0 for Premium plans"
          );
        }
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
          data.billingCycle.interval !== existingPlan?.billingCycle?.interval ||
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

          priceData.recurring = {
            interval: data.billingCycle.interval,
            interval_count: data.billingCycle.frequency,
          };

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

      const price = await stripe.prices.retrieve(priceId);
      if (!price.active) throw new BadRequestError("Price is inactive");

      const existingPendingPlan = await this._userPlanRepository.findByQuery({
        userId,
        status: PlanStatus.PENDING,
      });

      if (existingPendingPlan) {
        throw new BadRequestError(
          "You already have a pending subscription. Please cancel it before creating a new one."
        );
      }

      // const isRecurring = !!price.recurring;
      // const checkoutMode = isRecurring ? "subscription" : "payment";

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

      let subscriptionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        client_reference_id: userId,
        metadata: {
          userId,
          planId,
        },
      };

      const existingUserPlan = await this._userPlanRepository.findByQuery({
        userId,
        status: PlanStatus.ACTIVE,
      });

      if (existingUserPlan && existingUserPlan.status === PlanStatus.ACTIVE) {
        if (existingUserPlan.planId.toString() === planId) {
          throw new BadRequestError(
            "You already have an active subscription to this plan"
          );
        }

        if (existingUserPlan.currentPeriodEnd) {
          subscriptionParams.metadata!.pendingStartTimestamp = Math.floor(
            existingUserPlan.currentPeriodEnd.getTime() / 1000
          ).toString();
        }

        if (existingUserPlan.stripeSubscriptionId) {
          try {
            await stripe.subscriptions.update(
              existingUserPlan.stripeSubscriptionId,
              {
                cancel_at_period_end: true,
              }
            );
          } catch (error) {
            throw new Error(`Failed to update existing subscription: ${error}`);
          }
        }
      }

      const session = await stripe.checkout.sessions.create(subscriptionParams);

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
        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event);
          break;
        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(event);
          break;
        default:
          return;
      }
    } catch (error) {
      console.log(error);
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
      const { userId, planId, pendingStartTimestamp } = session.metadata || {};

      if (!userId || !planId) {
        throw new BadRequestError("Missing metadata in checkout session");
      }

      const plan = await this._planRepository.findById(planId);
      if (!plan) throw new NotFoundError("Plan not found");

      const existingUserPlan = await this._userPlanRepository.findByQuery({
        userId,
        status: PlanStatus.ACTIVE,
      });

      const userPlanData: Partial<IUserPlan> = {
        userId: new Types.ObjectId(userId),
        planId: new Types.ObjectId(planId),
        status: PlanStatus.ACTIVE,
        currentPeriodStart: new Date(),
      };

      let isPremium = plan.price > 0;
      const paymentData: Partial<IPayment> = {
        userId: new Types.ObjectId(userId),
        planId: new Types.ObjectId(planId),
        amount: plan.price,
        currency: "INR",
        status: "pending",
        createdAt: new Date(),
      };

      if (!session.subscription) {
        throw new InternalServerError("No subscription found in session");
      }
      const stripeSubscription = (await stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ["latest_invoice", "customer", "items.data.price.product"] }
      )) as Stripe.Subscription;
      logger.debug(JSON.stringify(stripeSubscription));
      userPlanData.stripeSubscriptionId = stripeSubscription.id;
      userPlanData.status = stripeSubscription.status as PlanStatus;
      userPlanData.currentPeriodStart = new Date(
        stripeSubscription.items.data[0].current_period_start * 1000
      );
      userPlanData.currentPeriodEnd = new Date(
        stripeSubscription.items.data[0].current_period_end * 1000
      );
      userPlanData.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

      if (stripeSubscription.latest_invoice) {
        const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
        paymentData.stripeInvoiceId = invoice.id;
        paymentData.status =
          invoice.status === "paid" ? "succeeded" : "pending";
        let paymentIntentId = null;
        if (invoice.payments?.data && invoice.payments.data.length > 0) {
          paymentIntentId = invoice.payments.data[0].payment.payment_intent;
        }
        if (paymentIntentId) {
          paymentData.stripePaymentIntentId = paymentIntentId as string;
        }
      }

      isPremium =
        stripeSubscription.status === PlanStatus.ACTIVE ||
        (stripeSubscription.cancel_at_period_end &&
          new Date(stripeSubscription.items.data[0].current_period_end * 1000) >
            new Date());

      if (
        existingUserPlan &&
        existingUserPlan.currentPeriodEnd &&
        pendingStartTimestamp
      ) {
        userPlanData.status = PlanStatus.PENDING;
        userPlanData.currentPeriodStart = new Date(
          parseInt(pendingStartTimestamp) * 1000
        );
        userPlanData.currentPeriodEnd = null;
      } else {
        userPlanData.status = PlanStatus.ACTIVE;
      }

      await this._paymentRepository.create(paymentData);
      await this._userPlanRepository.create(userPlanData);

      const user = await this._userRepository.findById(userId);
      if (user && !user.stripeCustomerId && session.customer) {
        await this._userRepository.update(userId, {
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer.id,
        });
      }

      if (!existingUserPlan || userPlanData.status === PlanStatus.ACTIVE) {
        await this._userRepository.update(userId, {
          planId: new Types.ObjectId(planId),
          isPremium,
        });
      }
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

      let status = subscription.status as PlanStatus;
      const now = new Date();

      if (
        userPlan.status === PlanStatus.PENDING &&
        now >= userPlan.currentPeriodStart
      ) {
        status = PlanStatus.ACTIVE;
        const existingActivePlan = await this._userPlanRepository.findByQuery({
          userId,
          status: PlanStatus.ACTIVE,
        });
        if (existingActivePlan && existingActivePlan.stripeSubscriptionId) {
          await stripe.subscriptions.update(
            existingActivePlan.stripeSubscriptionId,
            {
              cancel_at_period_end: true,
            }
          );
          logger.debug("cancel at period end : true for exist");
          await this._userPlanRepository.update(
            existingActivePlan._id.toString(),
            {
              status: PlanStatus.CANCELED,
              cancelAtPeriodEnd: true,
            }
          );
        }
      }

      const userPlanData: Partial<IUserPlan> = {
        status,
        currentPeriodStart: new Date(
          subscription.items.data[0].current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };

      await this._userPlanRepository.update(String(userPlan._id), userPlanData);

      if (event.type === "customer.subscription.deleted") {
        await this._userPlanRepository.update(userPlan._id.toString(), {
          status: PlanStatus.CANCELED,
        });

        const pendingPlan = await this._userPlanRepository.findByQuery({
          userId,
          status: PlanStatus.PENDING,
          currentPeriodStart: { $lte: now },
        });
        if (pendingPlan) {
          await this._userPlanRepository.update(pendingPlan._id.toString(), {
            status: PlanStatus.ACTIVE,
            currentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
          });
          await this._userRepository.update(userId, {
            planId: pendingPlan.planId,
            isPremium: plan.price > 0,
          });
        } else {
          await this._userRepository.update(userId, {
            planId: null,
            isPremium: false,
          });
        }
      }
    } catch (error) {
      if (error instanceof stripe.errors.StripeError) {
        throw new BadRequestError(`Stripe error: ${error.message}`);
      }
      throw error instanceof BadRequestError ||
        error instanceof NotFoundError ||
        error instanceof InternalServerError
        ? error
        : new InternalServerError(
            `An error occurred while processing subscription status change: ${error}`
          );
    }
  }

  async handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<void> {
    try {
      const invoice = event.data.object as Stripe.Invoice;
      let subscriptionId = null;
      if (invoice.lines?.data && invoice.lines.data.length > 0) {
        for (const line of invoice.lines.data) {
          if (line.parent?.subscription_item_details?.subscription) {
            subscriptionId = line.parent.subscription_item_details.subscription;
            break;
          }
        }
      }

      if (!subscriptionId) {
        logger.error(
          "not found subscriptionId from invoice of payment succeded event"
        );
        return;
      }

      const userPlan = await this._userPlanRepository.findByQuery({
        stripeSubscriptionId: subscriptionId,
      });

      if (!userPlan) {
        throw new NotFoundError("User plan not found for subscription");
      }

      const plan = await this._planRepository.findById(
        userPlan.planId.toString()
      );
      if (!plan) throw new NotFoundError("Plan not found");

      const exchangeRate = 0.012;
      const amountInInr = invoice.amount_paid / 100 / exchangeRate;

      let paymentIntentId = null;
      if (invoice.payments?.data && invoice.payments.data.length > 0) {
        paymentIntentId = invoice.payments.data[0].payment.payment_intent;
      }

      const paymentData: Partial<IPayment> = {
        userId: userPlan.userId,
        planId: userPlan.planId,
        amount: amountInInr,
        currency: "INR",
        status: "succeeded",
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: paymentIntentId as string,
        createdAt: new Date(invoice.created * 1000),
      };

      const existingPayment = await this._paymentRepository.findByQuery({
        stripeInvoiceId: invoice.id,
      });

      if (existingPayment) {
        await this._paymentRepository.update(existingPayment._id.toString(), {
          status: "succeeded",
          amount: amountInInr,
          stripePaymentIntentId: paymentIntentId as string | undefined,
        });
      } else {
        await this._paymentRepository.create(paymentData);
      }

      const now = new Date();
      if (
        userPlan.status === PlanStatus.PENDING &&
        now >= userPlan.currentPeriodStart
      ) {
        await this._userPlanRepository.update(userPlan._id.toString(), {
          status: PlanStatus.ACTIVE,
          currentPeriodEnd: new Date(
            (
              await stripe.subscriptions.retrieve(
                userPlan.stripeSubscriptionId!
              )
            ).items.data[0].current_period_end * 1000
          ),
        });

        await this._userRepository.update(userPlan.userId.toString(), {
          planId: userPlan.planId,
          isPremium: plan.price > 0,
        });
      } else if (
        userPlan.status === PlanStatus.ACTIVE ||
        userPlan.status === PlanStatus.PAST_DUE
      ) {
        await this._userPlanRepository.update(userPlan._id.toString(), {
          status: PlanStatus.ACTIVE,
        });
        await this._userRepository.update(userPlan.userId.toString(), {
          isPremium: plan.price > 0,
        });
      }
    } catch (error) {
      throw error instanceof NotFoundError || error instanceof BadRequestError
        ? error
        : new InternalServerError(
            `An error occurred while processing invoice payment succeeded: ${
              (error as Error).message
            }`
          );
    }
  }

  async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    try {
      const invoice = event.data.object as Stripe.Invoice;
      let subscriptionId = null;
      if (invoice.lines?.data && invoice.lines.data.length > 0) {
        for (const line of invoice.lines.data) {
          if (line.parent?.subscription_item_details?.subscription) {
            subscriptionId = line.parent.subscription_item_details.subscription;
            break;
          }
        }
      }
      if (!subscriptionId) {
        return;
      }

      const userPlan = await this._userPlanRepository.findByQuery({
        stripeSubscriptionId: subscriptionId,
      });

      if (!userPlan) {
        throw new NotFoundError("User plan not found for subscription");
      }

      const plan = await this._planRepository.findById(
        userPlan.planId.toString()
      );
      if (!plan) throw new NotFoundError("Plan not found");

      let paymentIntentId = null;
      if (invoice.payments?.data && invoice.payments.data.length > 0) {
        paymentIntentId = invoice.payments.data[0].payment.payment_intent;
      }

      const exchangeRate = 0.012;
      const amountInInr = invoice.amount_due / 100 / exchangeRate;

      const paymentData: Partial<IPayment> = {
        userId: userPlan.userId,
        planId: userPlan.planId,
        amount: amountInInr,
        currency: "INR",
        status: "failed",
        stripePaymentIntentId: paymentIntentId as string,
        createdAt: new Date(invoice.created * 1000),
      };

      const existingPayment = await this._paymentRepository.findByQuery({
        stripeInvoiceId: invoice.id,
      });

      if (existingPayment) {
        await this._paymentRepository.update(existingPayment._id.toString(), {
          status: "failed",
          amount: amountInInr,
          stripePaymentIntentId: paymentIntentId as string | undefined,
        });
      } else {
        await this._paymentRepository.create(paymentData);
      }

      if (userPlan.status === PlanStatus.ACTIVE) {
        await this._userPlanRepository.update(userPlan._id.toString(), {
          status: PlanStatus.PAST_DUE,
        });
        await this._userRepository.update(userPlan.userId.toString(), {
          isPremium: false,
        });
      }
    } catch (error) {
      throw error instanceof NotFoundError || error instanceof BadRequestError
        ? error
        : new InternalServerError(
            `An error occurred while processing invoice payment failed: ${
              (error as Error).message
            }`
          );
    }
  }

  async retryPayment(userId: string): Promise<string> {
    try {
      const userPlan = await this._userPlanRepository.findByQuery({
        userId,
        status: PlanStatus.PAST_DUE,
      });
      if (!userPlan) {
        throw new NotFoundError("No past_due subscription found for user");
      }

      if (!userPlan.stripeSubscriptionId) {
        throw new BadRequestError("No recurring subscription to retry");
      }

      const subscription = await stripe.subscriptions.retrieve(
        userPlan.stripeSubscriptionId,
        { expand: ["latest_invoice"] }
      );
      const invoice = subscription.latest_invoice as Stripe.Invoice;

      let paymentIntentId = null;
      if (invoice.payments?.data && invoice.payments.data.length > 0) {
        paymentIntentId = invoice.payments.data[0].payment.payment_intent;
      }

      if (!paymentIntentId) {
        throw new InternalServerError("No payment intent found for invoice");
      }

      const user = await this._userRepository.findById(userId);
      if (!user) throw new NotFoundError("User not found");

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: user.stripeCustomerId,
        mode: "payment",
        payment_intent_data: {
          setup_future_usage: "off_session",
        },
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        client_reference_id: userId,
        metadata: {
          userId,
          planId: userPlan.planId.toString(),
          subscriptionId: userPlan.stripeSubscriptionId,
          invoiceId: invoice.id!,
        },
      };

      sessionParams.line_items = [
        {
          price_data: {
            currency: invoice.currency,
            product_data: {
              name: "Invoice payment",
              description: `Payment for invoice ${invoice.id}`,
            },
            unit_amount: invoice.amount_due,
          },
          quantity: 1,
        },
      ];

      const session = await stripe.checkout.sessions.create(sessionParams);

      if (!session.url) {
        throw new InternalServerError("Failed to create checkout session");
      }

      return session.url;
    } catch (error) {
      if (error instanceof stripe.errors.StripeError) {
        throw new BadRequestError(`Stripe error: ${error.message}`);
      }
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError(
            `Failed to retry payment: ${(error as Error).message}`
          );
    }
  }

  async getUserPlan(
    userId: string
  ): Promise<{ userPlan: IUserPlan; plan: IPlan } | null> {
    try {
      const userPlan = await this._userPlanRepository.findByQuery({
        userId,
        status: PlanStatus.ACTIVE,
      });
      if (!userPlan) {
        // throw new NotFoundError("No active plan found for user");
        return null;
      }

      const plan = await this._planRepository.findById(
        userPlan.planId.toString()
      );
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

  async getPendingPlan(
    userId: string
  ): Promise<{ userPlan: IUserPlan; plan: IPlan } | null> {
    try {
      const userPlan = await this._userPlanRepository.findByQuery({
        userId,
        status: PlanStatus.PENDING,
      });
      if (!userPlan) {
        return null;
      }

      const plan = await this._planRepository.findById(
        userPlan.planId.toString()
      );
      if (!plan) {
        throw new NotFoundError("Plan not found");
      }

      return { userPlan, plan };
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError("Failed to retrieve pending plan");
    }
  }

  async cancelPendingSubscription(userId: string): Promise<void> {
    try {
      const pendingPlan = await this._userPlanRepository.findByQuery({
        userId,
        status: PlanStatus.PENDING,
      });

      if (!pendingPlan) {
        throw new NotFoundError("No pending subscription found for user");
      }

      if (pendingPlan.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.cancel(
          pendingPlan.stripeSubscriptionId
        );
        const invoice = await stripe.invoices.retrieve(
          subscription.latest_invoice as string
        );
        let paymentIntentId = null;
        if (invoice.payments?.data && invoice.payments.data.length > 0) {
          paymentIntentId = invoice.payments.data[0].payment.payment_intent;
        }
        if (paymentIntentId) {
          await stripe.refunds.create({
            payment_intent: paymentIntentId as string,
          });
        }
        await this._userPlanRepository.update(pendingPlan._id.toString(), {
          status: PlanStatus.CANCELED,
        });

        const existingPayment = await this._paymentRepository.findByQuery({
          stripeInvoiceId: invoice.id,
        });

        if (!existingPayment) {
          throw new NotFoundError("Payment not found for pending subscription");
        }

        await this._paymentRepository.update(existingPayment!._id.toString(), {
          status: "refunded",
          refundedAt: new Date(),
        });

        await this._userPlanRepository.update(pendingPlan._id.toString(), {
          status: PlanStatus.CANCELED,
        });
        logger.info(
          `Canceled pending subscription ${pendingPlan.stripeSubscriptionId}`
        );
      } else {
        throw new BadRequestError(
          "No payment information found for pending subscription"
        );
      }
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError("Failed to cancel pending subscription");
    }
  }

  async cancelActiveSubscription(userId: string): Promise<void> {
    try {
      const userPlan = await this._userPlanRepository.findByQuery({
        userId,
        status: PlanStatus.ACTIVE,
      });

      if (!userPlan) {
        throw new NotFoundError("No active subscription found for user");
      }

      if (userPlan.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.update(
          userPlan.stripeSubscriptionId,
          {
            cancel_at_period_end: true,
          }
        );

        await this._userPlanRepository.update(userPlan._id.toString(), {
          status: subscription.status as PlanStatus,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
      } else {
        throw new BadRequestError(
          "No payment information found for subscription"
        );
      }
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError("Failed to refund subscription");
    }
  }

  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: IUserPlan[];
    totalItems: number;
    totalPages: number;
  }> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestError("Invalid user ID");
      }
      if (page < 1 || limit < 1) {
        throw new BadRequestError("Page and limit must be positive numbers");
      }

      const history = await this._userPlanRepository.getHistory(
        userId,
        page,
        limit
      );
      return history;
    } catch (error) {
      throw error instanceof BadRequestError
        ? error
        : new InternalServerError("Failed to fetch subscription history");
    }
  }

  async syncSubscriptionStatuses(): Promise<void> {
    try {
      const now = new Date();

      const activePlans = await this._userPlanRepository.findAllByQuery({
        status: PlanStatus.ACTIVE,
      });

      if (activePlans && activePlans.length > 0) {
        for (const plan of activePlans) {
          if (
            plan.cancelAtPeriodEnd &&
            plan.currentPeriodEnd &&
            now >= plan.currentPeriodEnd
          ) {
            console.log("canceled");
            await this._userPlanRepository.update(plan._id.toString(), {
              status: PlanStatus.CANCELED,
            });

            await this._userRepository.update(plan.userId.toString(), {
              planId: null,
              isPremium: false,
            });

            logger.info(
              `Cron: Marked subscription ${plan.stripeSubscriptionId} as CANCELED due to cancel_at_period_end`
            );

            await this.activatePendingPlan(plan.userId.toString(), now);
          }
        }
      }

      const pastDuePlans = await this._userPlanRepository.findAllByQuery({
        status: PlanStatus.PAST_DUE,
      });

      if (pastDuePlans && pastDuePlans.length > 0) {
        for (const plan of pastDuePlans) {
          if (plan.stripeSubscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(
              plan.stripeSubscriptionId
            );
            if (
              subscription.status === "past_due" &&
              subscription.latest_invoice
            ) {
              const invoice = await stripe.invoices.retrieve(
                subscription.latest_invoice as string
              );

              if (invoice.attempt_count >= 3) {
                await stripe.subscriptions.cancel(plan.stripeSubscriptionId);
                await this._userPlanRepository.update(plan._id.toString(), {
                  status: PlanStatus.CANCELED,
                });
                await this._userRepository.update(plan.userId.toString(), {
                  planId: null,
                  isPremium: false,
                });
                logger.info(
                  `Cron: Canceled PAST_DUE subscription ${plan.stripeSubscriptionId} after ${invoice.attempt_count} failed attempts`
                );
              }
            }
          }
        }
      }

      const pendingPlans = await this._userPlanRepository.findAllByQuery({
        status: PlanStatus.PENDING,
        currentPeriodStart: { $lte: now },
      });

      if (pendingPlans && pendingPlans.length > 0) {
        for (const plan of pendingPlans) {
          if (plan.stripeSubscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(
              plan.stripeSubscriptionId
            );
            await this._userPlanRepository.update(plan._id.toString(), {
              status: PlanStatus.ACTIVE,
              currentPeriodEnd: new Date(
                subscription.items.data[0].current_period_end * 1000
              ),
            });

            const planDetails = await this._planRepository.findById(
              plan.planId.toString()
            );
            if (!planDetails) {
              logger.error(
                `Cron: Plan ${plan.planId} not found for pending plan activation`
              );
              continue;
            }

            await this._userRepository.update(plan.userId.toString(), {
              planId: plan.planId,
              isPremium: planDetails.price > 0,
            });

            logger.info(
              `Cron: Activated pending subscription ${plan.stripeSubscriptionId} for user ${plan.userId}`
            );
            const existingActivePlan =
              await this._userPlanRepository.findByQuery({
                userId: plan.userId,
                status: PlanStatus.ACTIVE,
                _id: { $ne: plan._id },
              });

            if (existingActivePlan && existingActivePlan.stripeSubscriptionId) {
              await stripe.subscriptions.update(
                existingActivePlan.stripeSubscriptionId,
                { cancel_at_period_end: true }
              );
              await this._userPlanRepository.update(
                existingActivePlan._id.toString(),
                {
                  status: PlanStatus.CANCELED,
                  cancelAtPeriodEnd: true,
                }
              );
              logger.info(
                `Cron: Set existing subscription ${existingActivePlan.stripeSubscriptionId} to cancel at period end`
              );
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Cron: Failed to sync subscription statuses: ${error}`);
      throw new InternalServerError("Failed to sync subscription statuses");
    }
  }

  private async activatePendingPlan(userId: string, now: Date): Promise<void> {
    const pendingPlan = await this._userPlanRepository.findByQuery({
      userId,
      status: PlanStatus.PENDING,
      currentPeriodStart: { $lte: now },
    });

    if (pendingPlan && pendingPlan.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        pendingPlan.stripeSubscriptionId
      );
      await this._userPlanRepository.update(pendingPlan._id.toString(), {
        status: PlanStatus.ACTIVE,
        currentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
      });

      const planDetails = await this._planRepository.findById(
        pendingPlan.planId.toString()
      );
      if (!planDetails) {
        logger.error(
          `Cron: Plan ${pendingPlan.planId} not found for pending plan activation`
        );
        return;
      }

      await this._userRepository.update(userId, {
        planId: pendingPlan.planId,
        isPremium: planDetails.price > 0,
      });

      logger.info(
        `Cron: Activated pending subscription ${pendingPlan.stripeSubscriptionId} for user ${userId}`
      );
    }
  }
}
