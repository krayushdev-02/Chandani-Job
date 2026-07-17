import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  coverImage?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  views: number;
  comments: Array<{
    user: mongoose.Types.ObjectId;
    text: string;
    date: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: { type: String },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>('Blog', BlogSchema);
