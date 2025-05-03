import { Schema, model, } from "mongoose";
// import { IUserSubscriptionModel } from "../types/user";

export interface IUserSubscription {
  userId: Schema.Types.ObjectId;
  subscriptionId: Schema.Types.ObjectId;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
};

interface IUserSubscriptionModel extends IUserSubscription, Document {};

const userSubscriptionSchema = new Schema<IUserSubscriptionModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: { type: String, required: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserSubscription = model<IUserSubscriptionModel>("UserSubscription", userSubscriptionSchema);