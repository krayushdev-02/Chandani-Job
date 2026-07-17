import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Job from '../models/Job';
import User from '../models/User';
import Company from '../models/Company';

export const searchJobs = async (req: Request, res: Response) => {
  const {
    q,
    location,
    workMode,
    type,
    experienceLevel,
    salaryMin,
    skills,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  const query: any = { status: 'Active' };

  // Search query (text search)
  if (q) {
    query.$or = [
      { title: { $regex: q as string, $options: 'i' } },
      { description: { $regex: q as string, $options: 'i' } },
    ];
  }

  if (location) {
    query.location = { $regex: location as string, $options: 'i' };
  }

  if (workMode) {
    query.workMode = workMode;
  }

  if (type) {
    query.type = type;
  }

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  if (salaryMin) {
    query.salaryMin = { $gte: parseInt(salaryMin as string) };
  }

  if (skills) {
    const skillList = (skills as string).split(',').map(s => s.trim());
    query.skillsRequired = { $in: skillList };
  }

  try {
    let sortObj: any = { datePosted: -1 }; // newest by default

    if (sort === 'salary') {
      sortObj = { salaryMax: -1, salaryMin: -1 };
    } else if (sort === 'views') {
      sortObj = { views: -1 };
    } else if (sort === 'applications') {
      sortObj = { applicationsCount: -1 };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const jobs = await Job.find(query)
      .populate('company', 'name logo location industry ratings')
      .populate('recruiter', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      jobs,
      total,
      pages: Math.ceil(total / parseInt(limit as string)),
      currentPage: parseInt(page as string),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo banner about website location industry ratings socialLinks culturePhotos benefits')
      .populate('recruiter', 'name email designation');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.status(200).json({ success: true, job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  const { title, description, location, workMode, type, experienceLevel, salaryMin, salaryMax, skillsRequired, responsibilities, benefits } = req.body;

  try {
    // Find recruiter companyId
    const companyId = req.user?.recruiterProfile?.companyId;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Your recruiter account is not yet associated with any company profile.',
      });
    }

    const job = await Job.create({
      title,
      description,
      company: companyId,
      recruiter: req.user?._id,
      location,
      workMode,
      type,
      experienceLevel,
      salaryMin,
      salaryMax,
      skillsRequired,
      responsibilities,
      benefits,
    });

    res.status(201).json({ success: true, message: 'Job posted successfully', job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is the recruiter or admin
    if (job.recruiter.toString() !== req.user?.id && req.user?.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job posting' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, job: updatedJob });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user?.id && req.user?.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job posting' });
    }

    await job.deleteOne();

    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const bookmarkJob = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const jobId = req.params.id;
    const index = user.seekerProfile?.savedJobs.findIndex(id => id.toString() === jobId);

    let bookmarked = false;
    if (user.seekerProfile) {
      if (index !== undefined && index > -1) {
        user.seekerProfile.savedJobs.splice(index, 1);
      } else {
        user.seekerProfile.savedJobs.push(jobId as any);
        bookmarked = true;
      }
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: bookmarked ? 'Job bookmarked successfully' : 'Bookmark removed successfully',
      bookmarked,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
