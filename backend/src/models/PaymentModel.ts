import mongoose, { Schema, Document, Types } from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = (mongooseSequence as any)(mongoose);

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  serialNumber: number; 
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  refundId?: string;
  refundedAt?: Date;
  createdAt: Date;
}

const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    serialNumber: { type: Number, required: true, unique: true }, 
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

PaymentSchema.plugin(AutoIncrement, { inc_field: 'serialNumber', start_seq: 1000 });

export default mongoose.model<IPayment>("Payment", PaymentSchema);