import { BillingInterval } from "../models/PlanModel";

export interface PlanDTO {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle?: {
      interval: BillingInterval;
      frequency: number;
    };
  features: string[];
  isArchived: boolean;
  stripePriceId?: string;
  createdAt?: string;
}

