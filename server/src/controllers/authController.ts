import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { EmailService } from '../services/emailService';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_secret_key_default_12345', {
    expiresIn: '30d',
  });
};

export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Job Seeker',
      otp,
      otpExpires,
    });

    // Send OTP Email
    await EmailService.sendOTPEmail(email, name, otp);

    res.status(214).json({
      success: true,
      message: 'Registration initiated. Verification OTP sent to email.',
      userId: user._id,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyOTP = async (req: AuthRequest, res: Response) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    await EmailService.sendWelcomeEmail(user.email, user.name);

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileCompleted: user.profileCompleted,
        wallet: user.wallet,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      // Re-send verification code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      await EmailService.sendOTPEmail(user.email, user.name, otp);

      return res.status(403).json({
        success: false,
        message: 'Account not verified. New OTP sent to email.',
        unverified: true,
      });
    }

    // Check 2FA
    if (user.isTwoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
      await user.save();
      await EmailService.sendOTPEmail(user.email, user.name, otp);

      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        message: 'Two-Factor OTP sent to email',
      });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileCompleted: user.profileCompleted,
        wallet: user.wallet,
        seekerProfile: user.seekerProfile,
        recruiterProfile: user.recruiterProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate('seekerProfile.savedJobs');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    
    if (user.role === 'Job Seeker') {
      user.seekerProfile = {
        title: req.body.title || user.seekerProfile?.title,
        skills: req.body.skills || user.seekerProfile?.skills || [],
        experienceYears: req.body.experienceYears ?? user.seekerProfile?.experienceYears,
        education: req.body.education || user.seekerProfile?.education,
        resumeUrl: req.body.resumeUrl || user.seekerProfile?.resumeUrl,
        portfolioUrl: req.body.portfolioUrl || user.seekerProfile?.portfolioUrl,
        githubUrl: req.body.githubUrl || user.seekerProfile?.githubUrl,
        linkedinUrl: req.body.linkedinUrl || user.seekerProfile?.linkedinUrl,
        about: req.body.about || user.seekerProfile?.about,
        savedJobs: user.seekerProfile?.savedJobs || [],
      };
    } else {
      user.recruiterProfile = {
        companyId: req.body.companyId || user.recruiterProfile?.companyId,
        designation: req.body.designation || user.recruiterProfile?.designation,
        verificationStatus: user.recruiterProfile?.verificationStatus || 'Pending',
      };
    }

    user.profileCompleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggle2FA = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    await user.save();

    res.status(200).json({
      success: true,
      message: `2FA ${user.isTwoFactorEnabled ? 'enabled' : 'disabled'} successfully`,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
