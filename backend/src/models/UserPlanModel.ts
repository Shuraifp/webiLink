import { Schema, model, Document } from "mongoose";

export interface IUserPlan extends Document {
  userId: Schema.Types.ObjectId;
  planId: Schema.Types.ObjectId;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userPlanSchema = new Schema<IUserPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: { type: String, required: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IUserPlan>("UserPlan", userPlanSchema);