import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  planName: 'Basic' | 'Professional' | 'Enterprise' | 'Premium Recruiter';
  amount: number;
  currency: string;
  transactionId: string;
  status: 'Pending' | 'Success' | 'Failed';
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planName: {
      type: String,
      enum: ['Basic', 'Professional', 'Enterprise', 'Premium Recruiter'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending',
    },
    invoiceUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
