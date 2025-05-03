import mongoose, { Schema, Types, Document } from "mongoose";


export interface IPlan extends PlanInput, Document {
  stripePriceId?: string;
  stripeProductId: string
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlanInput {
  name: string;
  description?: string;
  price: number;
  billingCycle: {
    interval: "day" | "week" | "month" | "year" | "lifetime";
    frequency: number;
  };
  features: string[];
  isArchived: boolean;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    billingCycle: {
      interval: { type: String, enum: ["day", "week", "month", "year", "lifetime"], required: true },
      frequency: { type: Number, required: true, min: 1 },
    },
    features: {type:[String]},
    isArchived: { type: Boolean, default: false },
    stripePriceId: { type: String, required: true },
    stripeProductId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPlan>("Plan", planSchema);
