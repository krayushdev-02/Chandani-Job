import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  rating: number; // 1-5
  title?: string;
  reviewText: string;
  type: 'Company' | 'Interview' | 'Salary';
  likes: number;
  replies: Array<{
    user: mongoose.Types.ObjectId;
    replyText: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    reviewText: { type: String, required: true },
    type: {
      type: String,
      enum: ['Company', 'Interview', 'Salary'],
      default: 'Company',
    },
    likes: { type: Number, default: 0 },
    replies: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        replyText: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
