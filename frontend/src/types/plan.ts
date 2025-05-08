export enum BillingInterval {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
  LIFETIME = "lifetime",
}

export interface Plan {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: {
    interval: BillingInterval;
    frequency: number;
  };
  features: string[];
  isArchived: boolean;
  stripeProductId: string;
  stripePriceId: string;  
}

export enum PlanStatus {
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
}

export interface IUserPlan {
  _id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
  status: PlanStatus;
  currentPeriodStart: Date;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}