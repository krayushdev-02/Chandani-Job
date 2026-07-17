import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Job from '../models/Job';
import Company from '../models/Company';
import Application from '../models/Application';
import Payment from '../models/Payment';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSeekers = await User.countDocuments({ role: 'Job Seeker' });
    const totalRecruiters = await User.countDocuments({ role: 'Recruiter' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'Active' });
    const totalApplications = await Application.countDocuments();

    // Calculate revenue
    const successfulPayments = await Payment.find({ status: 'Success' });
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

    // Job views / applications funnel
    const jobsList = await Job.find().select('title views applicationsCount company').populate('company', 'name').limit(5);

    // Recent applications
    const recentApplications = await Application.find()
      .populate('applicant', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalSeekers,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalApplications,
        totalRevenue,
        recentApplications,
        jobsList,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUsersList = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const moderateJob = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    res.status(200).json({ success: true, message: `Job status updated to ${status}`, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyCompany = async (req: AuthRequest, res: Response) => {
  const { isVerified } = req.body;
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    );
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' });

    res.status(200).json({ success: true, message: `Company verification set to ${isVerified}`, company });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyRecruiter = async (req: AuthRequest, res: Response) => {
  const { verificationStatus } = req.body; // 'Approved' or 'Rejected'
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.recruiterProfile) {
      user.recruiterProfile.verificationStatus = verificationStatus;
      await user.save();
    } else {
      return res.status(400).json({ success: false, message: 'User is not a Recruiter profile' });
    }

    res.status(200).json({ success: true, message: `Recruiter status set to ${verificationStatus}`, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
