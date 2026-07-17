import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';

// Controllers
import * as auth from '../controllers/authController';
import * as jobs from '../controllers/jobController';
import * as apps from '../controllers/applicationController';
import * as companies from '../controllers/companyController';
import * as chats from '../controllers/chatController';
import * as payments from '../controllers/paymentController';
import * as admin from '../controllers/adminController';
import * as ai from '../controllers/aiController';
import * as blogs from '../controllers/blogController';

const router = Router();

// ==========================================
// AUTH & PROFILE ROUTES
// ==========================================
router.post('/auth/register', auth.register);
router.post('/auth/verify-otp', auth.verifyOTP);
router.post('/auth/login', auth.login);
router.get('/auth/profile', protect, auth.getProfile);
router.put('/auth/profile', protect, auth.updateProfile);
router.post('/auth/toggle-2fa', protect, auth.toggle2FA);

// ==========================================
// JOB LISTING ROUTES
// ==========================================
router.get('/jobs', jobs.searchJobs);
router.get('/jobs/:id', jobs.getJob);
router.post(
  '/jobs',
  protect,
  authorize('Recruiter', 'Employer', 'HR Manager', 'Company Admin', 'Super Admin'),
  jobs.createJob
);
router.put(
  '/jobs/:id',
  protect,
  authorize('Recruiter', 'Employer', 'HR Manager', 'Company Admin', 'Super Admin'),
  jobs.updateJob
);
router.delete(
  '/jobs/:id',
  protect,
  authorize('Recruiter', 'Employer', 'HR Manager', 'Company Admin', 'Super Admin'),
  jobs.deleteJob
);
router.post('/jobs/:id/bookmark', protect, authorize('Job Seeker'), jobs.bookmarkJob);

// ==========================================
// APPLICATION ROUTES
// ==========================================
router.post('/applications/job/:id', protect, authorize('Job Seeker'), apps.applyJob);
router.get('/applications/seeker', protect, authorize('Job Seeker'), apps.getSeekerApplications);
router.get(
  '/applications/job/:jobId/applicants',
  protect,
  authorize('Recruiter', 'Employer', 'HR Manager', 'Company Admin', 'Super Admin'),
  apps.getJobApplicants
);
router.put(
  '/applications/:id/status',
  protect,
  authorize('Recruiter', 'Employer', 'HR Manager', 'Company Admin', 'Super Admin'),
  apps.updateApplicationStatus
);
router.post(
  '/applications/:id/interview',
  protect,
  authorize('Recruiter', 'Employer', 'HR Manager', 'Company Admin', 'Super Admin'),
  apps.scheduleInterview
);

// ==========================================
// COMPANY & REVIEWS ROUTES
// ==========================================
router.post('/companies', protect, authorize('Employer', 'Company Admin', 'Super Admin'), companies.createCompany);
router.get('/companies', companies.getCompanies);
router.get('/companies/:id', companies.getCompanyDetails);
router.post('/companies/:id/reviews', protect, companies.addReview);

// ==========================================
// CHAT & MESSAGING ROUTES
// ==========================================
router.get('/chats', protect, chats.getChats);
router.post('/chats', protect, chats.createChat);
router.get('/chats/:chatId/messages', protect, chats.getMessages);
router.post('/chats/:chatId/messages', protect, chats.sendMessage);

// ==========================================
// PAYMENT & BILLING ROUTES
// ==========================================
router.post('/payments/checkout', protect, payments.createCheckoutSession);
router.post('/payments/verify', protect, payments.verifyPayment);
router.post('/payments/webhook', payments.handleStripeWebhook);

// ==========================================
// AI COGNITIVE ROUTES
// ==========================================
router.post('/ai/analyze-resume', protect, ai.analyzeResume);
router.post('/ai/cover-letter', protect, ai.generateCoverLetter);
router.post('/ai/interview-questions', protect, ai.getInterviewQuestions);
router.post('/ai/evaluate-answer', protect, ai.evaluateInterviewAnswer);
router.post('/ai/career-guidance', protect, ai.getCareerGuidance);

// ==========================================
// BLOG CMS ROUTES
// ==========================================
router.get('/blogs', blogs.getBlogs);
router.get('/blogs/:id', blogs.getBlogDetails);
router.post(
  '/blogs',
  protect,
  authorize('Recruiter', 'Employer', 'HR Manager', 'Company Admin', 'Super Admin'),
  blogs.createBlog
);
router.post('/blogs/:id/comment', protect, blogs.addComment);

// ==========================================
// SYSTEM ADMINISTRATION ROUTES
// ==========================================
router.get('/admin/analytics', protect, authorize('Super Admin'), admin.getDashboardAnalytics);
router.get('/admin/users', protect, authorize('Super Admin'), admin.getUsersList);
router.put('/admin/jobs/:id/moderate', protect, authorize('Super Admin'), admin.moderateJob);
router.put('/admin/companies/:id/verify', protect, authorize('Super Admin'), admin.verifyCompany);
router.put('/admin/recruiters/:id/verify', protect, authorize('Super Admin'), admin.verifyRecruiter);

export default router;
