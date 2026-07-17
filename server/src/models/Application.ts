import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  resume: string; // URL
  coverLetter?: string;
  portfolioLinks: string[];
  status: 'Applied' | 'Reviewing' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Rejected' | 'Withdrawn';
  timeline: Array<{
    status: string;
    date: Date;
    comment?: string;
  }>;
  interviewSchedule?: {
    date: Date;
    type: 'Phone' | 'Technical' | 'HR' | 'Panel' | 'Other';
    link?: string; // Video URL like Zoom/Google Meet
    notes?: string;
  };
  offerLetter?: string; // PDF URL
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: String, required: true },
    coverLetter: { type: String },
    portfolioLinks: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn'],
      default: 'Applied',
    },
    timeline: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        comment: { type: String },
      },
    ],
    interviewSchedule: {
      date: { type: Date },
      type: {
        type: String,
        enum: ['Phone', 'Technical', 'HR', 'Panel', 'Other'],
      },
      link: { type: String },
      notes: { type: String },
    },
    offerLetter: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
