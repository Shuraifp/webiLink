import { Schema, model } from "mongoose";
// import { ISubscriptionModel } from "../types/user";

export interface ISubscription {
  name: string;
  description: string;
  features: string[];
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    name: { type: String, required: true },
    description: { type: String },
    features: { type: [String], required: true },
    stripeProductId: { type: String, required: true },
    stripePriceId: { type: String, required: true },
    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Subscription = model<ISubscription>("Subscription", subscriptionSchema);