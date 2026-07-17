import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Application from '../models/Application';
import Job from '../models/Job';
import User from '../models/User';
import { SocketService } from '../services/socketService';

export const applyJob = async (req: AuthRequest, res: Response) => {
  const { resumeUrl, coverLetter, portfolioLinks } = req.body;
  const jobId = req.params.id;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Check if already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user?.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user?.id,
      resume: resumeUrl || req.user?.seekerProfile?.resumeUrl,
      coverLetter,
      portfolioLinks: portfolioLinks || [],
      timeline: [{ status: 'Applied', comment: 'Application submitted successfully' }],
    });

    // Increment count
    job.applicationsCount += 1;
    await job.save();

    // Trigger notification via Socket to recruiter
    SocketService.sendToUser(
      job.recruiter.toString(),
      'new_application',
      { jobTitle: job.title, applicantName: req.user?.name, applicationId: application._id }
    );

    res.status(201).json({ success: true, message: 'Application submitted successfully', application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSeekerApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find({ applicant: req.user?.id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location' },
      });

    res.status(200).json({ success: true, applications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getJobApplicants = async (req: AuthRequest, res: Response) => {
  const jobId = req.params.jobId;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Verify ownership
    if (job.recruiter.toString() !== req.user?.id && req.user?.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view applicants' });
    }

    const applicants = await Application.find({ job: jobId })
      .populate('applicant', 'name email seekerProfile');

    res.status(200).json({ success: true, applicants });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  const { status, comment } = req.body;
  const appId = req.params.id;

  try {
    const application = await Application.findById(appId).populate('job');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Verify recruiter owns the job
    const job = application.job as any;
    if (job.recruiter.toString() !== req.user?.id && req.user?.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify application status' });
    }

    application.status = status;
    application.timeline.push({ status, date: new Date(), comment: comment || `Status updated to ${status}` });
    await application.save();

    // Notify applicant
    SocketService.sendToUser(
      application.applicant.toString(),
      'application_status_update',
      { jobTitle: job.title, status, comment }
    );

    res.status(200).json({ success: true, message: 'Application status updated', application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const scheduleInterview = async (req: AuthRequest, res: Response) => {
  const { date, type, link, notes } = req.body;
  const appId = req.params.id;

  try {
    const application = await Application.findById(appId).populate('job');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const job = application.job as any;
    if (job.recruiter.toString() !== req.user?.id && req.user?.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to schedule interview' });
    }

    application.interviewSchedule = { date: new Date(date), type, link, notes };
    application.status = 'Interviewing';
    application.timeline.push({
      status: 'Interviewing',
      date: new Date(),
      comment: `Interview scheduled on ${new Date(date).toLocaleString()} (${type})`,
    });
    
    await application.save();

    // Notify Seeker
    SocketService.sendToUser(
      application.applicant.toString(),
      'interview_scheduled',
      { jobTitle: job.title, date, type, link, notes }
    );

    res.status(200).json({ success: true, message: 'Interview scheduled successfully', application });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
