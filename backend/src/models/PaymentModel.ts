import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  refundId: string;
  refundedAt: Date;
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["succeeded", "pending", "failed", "refunded"],
      required: true,
    },
    stripePaymentIntentId: { type: String },
    stripeInvoiceId: { type: String },
    refundId: { type: String },
    refundedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
