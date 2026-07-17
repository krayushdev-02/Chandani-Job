import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', ChatSchema);
