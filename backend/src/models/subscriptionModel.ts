import { Schema, model } from "mongoose";
import { ISubscriptionModel } from "../types/user";


const subscriptionSchema = new Schema<ISubscriptionModel>(
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

export const Subscription = model<ISubscriptionModel>("Subscription", subscriptionSchema);