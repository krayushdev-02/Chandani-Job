import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Company from '../models/Company';
import Job from '../models/Job';
import Blog from '../models/Blog';
import Review from '../models/Review';
import { logger } from '../utils/logger';

dotenv.config();

const seedData = async () => {
  try {
    const connString = process.env.MONGO_URI || 'mongodb://localhost:27017/chandandijobs';
    await mongoose.connect(connString);
    logger.info('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Blog.deleteMany({});
    await Review.deleteMany({});
    logger.info('Cleared existing collections.');

    // 1. Create Users
    logger.info('Creating seeding users...');
    
    // Passwords will be automatically hashed by User model pre-save hook
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@chandandijobs.com',
      password: 'Password123',
      role: 'Super Admin',
      isVerified: true,
      profileCompleted: true,
    });

    const recruiter = await User.create({
      name: 'Ayush Kumar',
      email: 'ayushk2375@gmail.com',
      password: 'Password123',
      role: 'Recruiter',
      isVerified: true,
      profileCompleted: true,
      recruiterProfile: {
        designation: 'Lead Engineering Recruiter',
        verificationStatus: 'Approved',
      },
    });

    const seeker = await User.create({
      name: 'Rahul Sharma',
      email: 'seeker@chandandijobs.com',
      password: 'Password123',
      role: 'Job Seeker',
      isVerified: true,
      profileCompleted: true,
      seekerProfile: {
        title: 'React & Frontend Developer',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'JavaScript'],
        experienceYears: 2,
        education: 'B.Tech in Computer Science',
        about: 'Passionate frontend developer interested in creating interactive, glassmorphic UI designs and optimizing web speeds.',
      },
    });

    // 2. Create Companies
    logger.info('Creating seeding companies...');
    const google = await Company.create({
      name: 'Google India',
      about: 'Google’s mission is to organize the world’s information and make it universally accessible and useful.',
      website: 'https://google.com',
      location: 'Bengaluru, Karnataka',
      industry: 'Technology & Internet',
      employeeCount: '10000+',
      isVerified: true,
      socialLinks: { linkedin: 'https://linkedin.com/company/google' },
      culturePhotos: ['https://images.unsplash.com/photo-1497215728101-856f4ea42174'],
      benefits: ['Free Meals', 'Health Insurance', 'Remote Work Options', 'Gym Memberships'],
      creator: recruiter._id,
      recruiters: [recruiter._id as any],
    });

    const stripe = await Company.create({
      name: 'Stripe India',
      about: 'Stripe is a financial infrastructure platform for the internet.',
      website: 'https://stripe.com',
      location: 'Mumbai, Maharashtra',
      industry: 'Financial Technology',
      employeeCount: '1000-5000',
      isVerified: true,
      socialLinks: { linkedin: 'https://linkedin.com/company/stripe' },
      culturePhotos: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c'],
      benefits: ['Flexible Hours', 'Stock Options', 'Education Stipend'],
      creator: recruiter._id,
      recruiters: [recruiter._id as any],
    });

    // Link Recruiter to Google India
    recruiter.recruiterProfile!.companyId = google._id as any;
    await recruiter.save();

    // 3. Create Jobs
    logger.info('Creating seeding jobs...');
    await Job.create([
      {
        title: 'Senior Frontend Engineer (React)',
        description: 'We are looking for a Senior Frontend Developer to design and implement premium web interfaces using React 19 and Tailwind CSS. You will work on user-facing dashboard tools and collaborate with product managers.',
        company: google._id,
        recruiter: recruiter._id,
        location: 'Bengaluru, Karnataka',
        workMode: 'Hybrid',
        type: 'Full-time',
        experienceLevel: 'Mid-Senior',
        salaryMin: 1800000,
        salaryMax: 3000000,
        skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'Framer Motion'],
        responsibilities: [
          'Build reusable dashboard charts and responsive components.',
          'Optimize core pages to achieve lighthouse score of 95+.',
          'Mentor junior frontend engineers and run code reviews.',
        ],
        benefits: ['Full health cover', 'Annual bonus', 'Travel allowance'],
      },
      {
        title: 'Full Stack Engineer (MERN)',
        description: 'Join our backend core infrastructure group building financial transaction portals. This role requires full lifecycle knowledge of Node, Express, MongoDB Atlas, and React.',
        company: stripe._id,
        recruiter: recruiter._id,
        location: 'Remote',
        workMode: 'Remote',
        type: 'Full-time',
        experienceLevel: 'Associate',
        salaryMin: 1200000,
        salaryMax: 2200000,
        skillsRequired: ['Node.js', 'Express.js', 'MongoDB', 'React', 'TypeScript'],
        responsibilities: [
          'Design robust backend endpoints and Mongoose schemas.',
          'Secure APIs using helmet, rate limiters, and JWT tokens.',
          'Implement payment processing gateways (Stripe/Razorpay).',
        ],
        benefits: ['Home office setup stipend', 'Unlimited paid time off', 'Stock shares'],
      },
      {
        title: 'UI/UX React Intern',
        description: 'Looking for a passionate junior developer who loves animations, glassmorphism, and styling. Working directly with design leads on customer portals.',
        company: google._id,
        recruiter: recruiter._id,
        location: 'Bengaluru, Karnataka',
        workMode: 'Onsite',
        type: 'Internship',
        experienceLevel: 'Entry level',
        salaryMin: 30000,
        salaryMax: 60000,
        skillsRequired: ['React', 'CSS', 'Framer Motion', 'Figma'],
        responsibilities: [
          'Translate Figma mockups into responsive HTML/CSS structures.',
          'Refine transitions and loading skeletons.',
        ],
        benefits: ['Free catered meals', 'Placement offer opportunity'],
      },
    ]);

    // 4. Create Blogs
    logger.info('Creating seeding blogs...');
    await Blog.create([
      {
        title: 'How to Crack the MERN Stack Interview in 2026',
        content: 'MERN stack development has evolved with React 19, newer caching patterns, and server components. In this guide, we break down top question lists covering MongoDB query indexings, Node.js concurrency loop engines, and custom React hook closures...',
        author: superAdmin._id,
        category: 'Interview Preparation',
        tags: ['MERN Stack', 'React', 'Node.js', 'Interview Advice'],
        isPublished: true,
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
      },
      {
        title: 'Mastering ATS Resume Templates: The Ultimate Checklist',
        content: 'Applicant Tracking Systems (ATS) scan and rank resumes by matching key skills phrases. To optimize your score: avoid using canvas shapes or fancy tables, keep files readable in DOC/PDF, list exact technologies from requirements, and write clear STAR sentences...',
        author: superAdmin._id,
        category: 'Career Growth',
        tags: ['ATS Resume', 'Resume Advice', 'AI tools'],
        isPublished: true,
        coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
      },
    ]);

    // 5. Create Review
    logger.info('Creating company review...');
    await Review.create({
      user: seeker._id,
      company: google._id,
      rating: 5,
      title: 'Amazing work culture and premium perks',
      reviewText: 'Google provides a world-class environment with massive growth prospects, smart teammates, and incredible benefits.',
      type: 'Company',
    });

    // Update company stats
    google.ratings = { average: 5, count: 1 };
    await google.save();

    logger.info('Database seeded successfully!');
    process.exit(0);
  } catch (error: any) {
    logger.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
