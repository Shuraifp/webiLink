  import { Schema, model, Document, Types } from "mongoose";

  export enum PlanStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  PAST_DUE = "past_due",
  PENDING = "pending",
}

  export interface IUserPlan extends Document {
    _id: Types.ObjectId | string;
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    stripeSubscriptionId?: string;
    stripeInvoiceId?: string;
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
      stripeInvoiceId: { type: String },
      status: { type: String, enum: Object.values(PlanStatus), required: true },
      currentPeriodStart: { type: Date, required: true },
      currentPeriodEnd: { type: Date, default: null },
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  export default model<IUserPlan>("UserPlan", userPlanSchema);