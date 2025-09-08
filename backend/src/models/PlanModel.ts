import mongoose, { Schema } from "mongoose";
import { IPlan } from "../types/models";


const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    billingCycle: {
      interval: {
        type: String,
        enum: ["day", "week", "month", "year"],
      },
      frequency: { type: Number, min: 1 },
    },
    features: { type: [String] },
    isArchived: { type: Boolean, default: false },
    stripePriceId: { type: String },
    stripeProductId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPlan>("Plan", planSchema);
