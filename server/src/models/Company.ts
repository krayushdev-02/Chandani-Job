import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  logo?: string;
  banner?: string;
  about: string;
  website?: string;
  location: string;
  industry: string;
  employeeCount?: string;
  isVerified: boolean;
  socialLinks: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  culturePhotos: string[];
  benefits: string[];
  ratings: {
    average: number;
    count: number;
  };
  creator: mongoose.Types.ObjectId;
  recruiters: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    logo: { type: String },
    banner: { type: String },
    about: { type: String, required: true },
    website: { type: String },
    location: { type: String, required: true },
    industry: { type: String, required: true },
    employeeCount: { type: String, default: '1-10' },
    isVerified: { type: Boolean, default: false },
    socialLinks: {
      website: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      facebook: { type: String },
    },
    culturePhotos: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recruiters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', CompanySchema);
