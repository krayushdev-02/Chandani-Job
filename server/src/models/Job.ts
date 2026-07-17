import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  company: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary';
  experienceLevel: string; // e.g. 'Entry level', 'Associate', 'Mid-Senior', 'Director'
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  skillsRequired: string[];
  responsibilities: string[];
  benefits: string[];
  educationRequired?: string;
  status: 'Active' | 'Inactive' | 'Draft';
  views: number;
  applicationsCount: number;
  datePosted: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Onsite'],
      required: true,
      default: 'Onsite',
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
      required: true,
      default: 'Full-time',
    },
    experienceLevel: { type: String, required: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: 'INR' },
    skillsRequired: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    educationRequired: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Draft'],
      default: 'Active',
    },
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
    datePosted: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IJob>('Job', JobSchema);
