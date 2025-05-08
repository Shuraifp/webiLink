  import { Schema, model, Document, Types } from "mongoose";

  export enum PlanStatus {
    ACTIVE = "active",
    PAST_DUE = "past_due",
    CANCELED = "canceled",
  }

  export interface IUserPlan extends Document {
    _id: Types.ObjectId | string;
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    stripeSubscriptionId?: string;
    stripePaymentIntentId?: string;
    status: PlanStatus;
    currentPeriodStart: Date;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

  const userPlanSchema = new Schema<IUserPlan>(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
      stripeSubscriptionId: { type: String },
      stripePaymentIntentId: { type: String },
      status: { type: String, enum: Object.values(PlanStatus), required: true },
      currentPeriodStart: { type: Date, required: true },
      currentPeriodEnd: { type: Date, default: null },
      cancelAtPeriodEnd: { type: Boolean, default: false },// ?
    },
    { timestamps: true }
  );

  export default model<IUserPlan>("UserPlan", userPlanSchema);