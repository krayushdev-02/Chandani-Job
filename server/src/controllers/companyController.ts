import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Company from '../models/Company';
import Review from '../models/Review';

export const createCompany = async (req: AuthRequest, res: Response) => {
  const { name, about, website, location, industry, employeeCount, socialLinks, benefits } = req.body;

  try {
    const companyExists = await Company.findOne({ name });
    if (companyExists) {
      return res.status(400).json({ success: false, message: 'Company name already registered' });
    }

    const company = await Company.create({
      name,
      about,
      website,
      location,
      industry,
      employeeCount,
      socialLinks: socialLinks || {},
      benefits: benefits || [],
      creator: req.user?._id,
      recruiters: [req.user?._id as any],
    });

    // If creator is recruiter, link them automatically
    if (req.user) {
      req.user.recruiterProfile = {
        companyId: company._id as any,
        designation: req.body.designation || 'Company Administrator',
        verificationStatus: 'Approved',
      };
      await req.user.save();
    }

    res.status(201).json({ success: true, message: 'Company registered successfully', company });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({ isVerified: true });
    res.status(200).json({ success: true, companies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCompanyDetails = async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company profile not found' });

    const reviews = await Review.find({ company: company._id }).populate('user', 'name');

    res.status(200).json({ success: true, company, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addReview = async (req: AuthRequest, res: Response) => {
  const { rating, title, reviewText, type } = req.body;
  const companyId = req.params.id;

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    const review = await Review.create({
      user: req.user?.id,
      company: companyId,
      rating,
      title,
      reviewText,
      type: type || 'Company',
    });

    // Update company metrics
    const allReviews = await Review.find({ company: companyId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    
    company.ratings.count = allReviews.length;
    company.ratings.average = parseFloat((totalRating / allReviews.length).toFixed(1));
    await company.save();

    res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
