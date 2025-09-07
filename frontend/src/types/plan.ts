export enum BillingInterval {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export interface Plan {
  id?: string;
  name: string;
  description?: string;
  price: number;
  billingCycle?: {
    interval: BillingInterval;
    frequency: number;
  };
  features: string[];
  isArchived: boolean;
  stripePriceId: string;  
}

 export enum PlanStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  PAST_DUE = "past_due",
  PENDING = "pending",
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