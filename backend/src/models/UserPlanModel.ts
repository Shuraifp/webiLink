import { Schema, model } from "mongoose";
import { IUserPlan, PlanStatus } from "../types/models";

const userPlanSchema = new Schema<IUserPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    stripeSubscriptionId: { type: String },
    stripeInvoiceId: { type: String },
    status: { type: String, enum: Object.values(PlanStatus), required: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IUserPlan>("UserPlan", userPlanSchema);
