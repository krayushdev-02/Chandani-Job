import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AIService } from '../services/aiService';

export const analyzeResume = async (req: AuthRequest, res: Response) => {
  const { resumeText, jobSkills = [] } = req.body;

  try {
    const analysis = await AIService.analyzeResume(resumeText, jobSkills);
    res.status(200).json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateCoverLetter = async (req: AuthRequest, res: Response) => {
  const { companyName, jobTitle, userName, userSkills = [] } = req.body;

  try {
    const name = userName || req.user?.name || 'Applicant';
    const skills = userSkills.length > 0 ? userSkills : (req.user?.seekerProfile?.skills || ['Software Development']);
    
    const coverLetter = await AIService.generateCoverLetter(name, skills, companyName, jobTitle);
    res.status(200).json({ success: true, coverLetter });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInterviewQuestions = async (req: AuthRequest, res: Response) => {
  const { jobTitle, jobDescription = '' } = req.body;

  try {
    const questions = await AIService.generateInterviewQuestions(jobTitle, jobDescription);
    res.status(200).json({ success: true, questions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const evaluateInterviewAnswer = async (req: AuthRequest, res: Response) => {
  const { question, answer } = req.body;

  try {
    const evaluation = await AIService.evaluateAnswer(question, answer);
    res.status(200).json({ success: true, ...evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCareerGuidance = async (req: AuthRequest, res: Response) => {
  const { skills = [], interests = [] } = req.body;

  try {
    const userSkills = skills.length > 0 ? skills : (req.user?.seekerProfile?.skills || []);
    const guidance = await AIService.getCareerGuidance(userSkills, interests);
    res.status(200).json({ success: true, ...guidance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
