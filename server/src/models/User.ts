import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Job Seeker' | 'Recruiter' | 'Employer' | 'HR Manager' | 'Company Admin' | 'Super Admin';
  profileCompleted: boolean;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  otp?: string;
  otpExpires?: Date;
  wallet: {
    balance: number;
    rewardPoints: number;
  };
  seekerProfile?: {
    title?: string;
    skills: string[];
    experienceYears?: number;
    education?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    about?: string;
    savedJobs: mongoose.Types.ObjectId[];
  };
  recruiterProfile?: {
    companyId?: mongoose.Types.ObjectId;
    designation?: string;
    verificationStatus: 'Pending' | 'Approved' | 'Rejected';
  };
  compareJobs?: mongoose.Types.ObjectId[];
  compareCompanies?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Job Seeker', 'Recruiter', 'Employer', 'HR Manager', 'Company Admin', 'Super Admin'],
      default: 'Job Seeker',
    },
    profileCompleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    otp: { type: String },
    otpExpires: { type: Date },
    wallet: {
      balance: { type: Number, default: 0 },
      rewardPoints: { type: Number, default: 0 },
    },
    seekerProfile: {
      title: { type: String },
      skills: { type: [String], default: [] },
      experienceYears: { type: Number, default: 0 },
      education: { type: String },
      resumeUrl: { type: String },
      portfolioUrl: { type: String },
      githubUrl: { type: String },
      linkedinUrl: { type: String },
      about: { type: String },
      savedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    },
    recruiterProfile: {
      companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
      designation: { type: String },
      verificationStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
      },
    },
    compareJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password || '');
};

export default mongoose.model<IUser>('User', UserSchema);
