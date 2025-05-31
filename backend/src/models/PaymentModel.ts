import mongoose, { Schema, Document, Types } from "mongoose";
// import mongooseSequence from "mongoose-sequence";

// const AutoIncrement = (mongooseSequence as any)(mongoose);

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
    serialNumber: { type: Number }, 
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

PaymentSchema.pre('save', async function (next) {
  if (this.isNew && !this.serialNumber) {
    try {
      const lastPayment = await mongoose.model('Payment').findOne().sort({ serialNumber: -1 }).exec();
      this.serialNumber = lastPayment && lastPayment.serialNumber ? lastPayment.serialNumber + 1 : 1000;
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

PaymentSchema.index({ serialNumber: 1 }, { unique: true });


export default mongoose.model<IPayment>("Payment", PaymentSchema);