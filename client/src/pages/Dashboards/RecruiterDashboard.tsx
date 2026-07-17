import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Plus, Briefcase, Users, Clock, FileText, CalendarDays 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Company {
  _id: string;
  name: string;
  isVerified: boolean;
}

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  workMode: string;
  applicationsCount: number;
  views: number;
  status: 'Active' | 'Inactive' | 'Draft';
  createdAt: string;
}

interface Applicant {
  _id: string;
  applicant: {
    _id: string;
    name: string;
    email: string;
    seekerProfile?: { title?: string; skills: string[]; resumeUrl?: string };
  };
  job: { title: string };
  status: string;
  createdAt: string;
}

const RecruiterDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // States
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'post-job' | 'applicants'>('listings');
  
  // Post Job form values
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Remote');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Senior');
  const [skillsText, setSkillsText] = useState('');
  const [salaryMin, setSalaryMin] = useState(600000);
  const [salaryMax, setSalaryMax] = useState(1200000);
  const [posting, setPosting] = useState(false);

  // Interview state
  const [schedulingApp, setSchedulingApp] = useState<Applicant | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewType, setInterviewType] = useState<'Technical' | 'HR' | 'Phone' | 'Panel'>('Technical');
  const [interviewLink, setInterviewLink] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [submittingInterview, setSubmittingInterview] = useState(false);

  // Load recruiter details and jobs
  const loadDashboardData = async () => {
    try {
      if (user?.recruiterProfile?.companyId) {
        const companyRes = await api.get(`/companies/${user.recruiterProfile.companyId}`);
        setCompany(companyRes.data.company);
        
        // Filter jobs by company
        const jobsRes = await api.get('/jobs');
        const companyJobs = jobsRes.data.jobs.filter((j: any) => j.company._id === user.recruiterProfile?.companyId);
        setJobs(companyJobs);

        // Fetch all candidates for these jobs
        const applicantsList: Applicant[] = [];
        for (const job of companyJobs) {
          try {
            const appRes = await api.get(`/applications/job/${job._id}/applicants`);
            applicantsList.push(...appRes.data.applicants);
          } catch (e) {
            // Ignore if error
          }
        }
        setApplicants(applicantsList);
      }
    } catch (error) {
      toast.error('Could not retrieve recruiter dashboard details.');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) {
      return toast.error('Please create or associate your company profile first.');
    }

    setPosting(true);
    try {
      const skillsRequired = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/jobs', {
        title,
        description,
        location,
        workMode,
        type,
        experienceLevel,
        skillsRequired,
        salaryMin,
        salaryMax,
      });

      toast.success('Job posted successfully!');
      setTitle('');
      setDescription('');
      setLocation('');
      setSkillsText('');
      setActiveTab('listings');
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not post job.');
    } finally {
      setPosting(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success(`Application status set to ${status}`);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to change status.');
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp) return;

    setSubmittingInterview(true);
    try {
      await api.post(`/applications/${schedulingApp._id}/interview`, {
        date: interviewDate,
        type: interviewType,
        link: interviewLink,
        notes: interviewNotes,
      });
      toast.success('Interview scheduled and applicant notified.');
      setSchedulingApp(null);
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to schedule interview.');
    } finally {
      setSubmittingInterview(false);
    }
  };

  // Toggle company profile modal or redirection logic
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [compName, setCompName] = useState('');
  const [compAbout, setCompAbout] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compLoc, setCompLoc] = useState('');
  const [compInd, setCompInd] = useState('');
  const [creatingComp, setCreatingComp] = useState(false);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingComp(true);
    try {
      const res = await api.post('/companies', {
        name: compName,
        about: compAbout,
        website: compWebsite,
        location: compLoc,
        industry: compInd,
      });
      toast.success('Company profile created successfully!');
      setCompany(res.data.company);
      setCreateCompanyOpen(false);
      // Reload profile/session details
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not create company profile.');
    } finally {
      setCreatingComp(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner / Header */}
      <div className="glass p-6 rounded-3xl border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
        <div>
          <h2 className="text-xl font-bold">Recruiter Command Workspace</h2>
          <p className="text-sm text-gray-400 mt-1">
            {company ? (
              <span>Associated Company: <strong>{company.name}</strong> {company.isVerified ? '✓ Verified' : '(Pending Verification)'}</span>
            ) : (
              <span className="text-amber-400 font-semibold">Please complete company profile registration to start posting roles.</span>
            )}
          </p>
        </div>

        {!company && (
          <button
            onClick={() => setCreateCompanyOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/25"
          >
            Create Company Page
          </button>
        )}
      </div>

      {/* Grid Tabs and Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Options (3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass p-2.5 rounded-2xl border-white/5 space-y-1">
            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'listings' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Briefcase className="h-4.5 w-4.5" />
              Manage Postings ({jobs.length})
            </button>
            <button
              disabled={!company}
              onClick={() => setActiveTab('post-job')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                !company ? 'opacity-40 cursor-not-allowed' : ''
              } ${activeTab === 'post-job' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <Plus className="h-4.5 w-4.5" />
              Post New Opening
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'applicants' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Applicant Pipelines ({applicants.length})
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="glass p-5 rounded-2xl border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hiring Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Views</span>
                <span className="text-xl font-extrabold text-white">{jobs.reduce((sum, j) => sum + j.views, 0)}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Applications</span>
                <span className="text-xl font-extrabold text-indigo-400">{applicants.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right view (9 columns) */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: Manage postings */}
          {activeTab === 'listings' && (
            <div className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold">Active Openings</h3>

              {jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="h-10 w-10 text-indigo-500/30 mx-auto mb-3" />
                  No jobs posted yet. Post a new opening to start collecting applicants.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-400 border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-gray-500 uppercase font-semibold">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Work Mode</th>
                        <th className="pb-3 text-center">Views</th>
                        <th className="pb-3 text-center">Applicants</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job._id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                          <td className="py-4 font-semibold text-white">
                            {job.title}
                            <span className="block text-[10px] font-normal text-gray-500 mt-0.5">{job.location}</span>
                          </td>
                          <td className="py-4">{job.workMode} / {job.type}</td>
                          <td className="py-4 text-center">{job.views}</td>
                          <td className="py-4 text-center text-indigo-400 font-bold">{job.applicationsCount}</td>
                          <td className="py-4 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              job.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-gray-500/10 text-gray-400 border border-gray-500/10'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Post Job Form */}
          {activeTab === 'post-job' && (
            <form onSubmit={handlePostJob} className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold">Post New Job Opening</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Senior Full Stack Engineer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bengaluru, Karnataka (or Remote)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job Details Description</label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail job requirements, everyday responsibilities, expectations..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer text-gray-300"
                  >
                    <option value="Remote" className="bg-[#0b0b0f]">Remote</option>
                    <option value="Hybrid" className="bg-[#0b0b0f]">Hybrid</option>
                    <option value="Onsite" className="bg-[#0b0b0f]">Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer text-gray-300"
                  >
                    <option value="Full-time" className="bg-[#0b0b0f]">Full-time</option>
                    <option value="Part-time" className="bg-[#0b0b0f]">Part-time</option>
                    <option value="Contract" className="bg-[#0b0b0f]">Contract</option>
                    <option value="Internship" className="bg-[#0b0b0f]">Internship</option>
                    <option value="Temporary" className="bg-[#0b0b0f]">Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Experience level</label>
                  <input
                    type="text"
                    required
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    placeholder="3-5 years"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, Node.js, TypeScript, REST APIs"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Salary range minimum (INR / yr)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Salary range maximum (INR / yr)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={posting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {posting && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
                  Publish Role
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Applicants pipelines */}
          {activeTab === 'applicants' && (
            <div className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold">Applicant Pipelines</h3>

              {applicants.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-10 w-10 text-indigo-500/30 mx-auto mb-3" />
                  No candidate submissions collected yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {applicants.map((app) => (
                    <div key={app._id} className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                      
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div>
                          <h4 className="font-bold text-white text-base">{app.applicant.name}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Applied for: <strong>{app.job.title}</strong></p>
                        </div>

                        {/* Status update box */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">Status:</span>
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg py-1 px-2.5 text-xs text-indigo-400 font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="Applied" className="bg-[#0b0b0f] text-gray-300">Applied</option>
                            <option value="Reviewing" className="bg-[#0b0b0f] text-gray-300">Reviewing</option>
                            <option value="Shortlisted" className="bg-[#0b0b0f] text-gray-300">Shortlisted</option>
                            <option value="Interviewing" className="bg-[#0b0b0f] text-gray-300">Interviewing</option>
                            <option value="Offered" className="bg-[#0b0b0f] text-emerald-400">Offered</option>
                            <option value="Rejected" className="bg-[#0b0b0f] text-red-400">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {/* Candidate Profile Details */}
                      <div className="text-sm text-gray-300 space-y-2">
                        {app.applicant.seekerProfile?.title && (
                          <p><strong>Professional:</strong> {app.applicant.seekerProfile.title}</p>
                        )}
                        {app.applicant.seekerProfile?.skills && app.applicant.seekerProfile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <strong className="text-xs mr-1 text-gray-400">Skills:</strong>
                            {app.applicant.seekerProfile.skills.map(s => (
                              <span key={s} className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-400">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions footer */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
                        {app.applicant.seekerProfile?.resumeUrl ? (
                          <a 
                            href={app.applicant.seekerProfile.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:underline"
                          >
                            <FileText className="h-4 w-4" /> Download Candidate Resume
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500">No profile resume uploaded</span>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSchedulingApp(app)}
                            className="bg-white/5 hover:bg-white/10 text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CalendarDays className="h-4 w-4" /> Schedule Interview
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* CREATE COMPANY MODAL */}
      <AnimatePresence>
        {createCompanyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-lg w-full p-6 md:p-8 rounded-3xl relative overflow-hidden"
            >
              <h2 className="text-xl font-bold mb-1">Register Company Details</h2>
              <p className="text-xs text-gray-400 mb-6">Enter details to generate your brand listing page.</p>

              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Name</label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    placeholder="Google India"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Executive Summary (About)</label>
                  <textarea
                    rows={3}
                    required
                    value={compAbout}
                    onChange={(e) => setCompAbout(e.target.value)}
                    placeholder="We build financial systems..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Website URL</label>
                    <input
                      type="text"
                      value={compWebsite}
                      onChange={(e) => setCompWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Industry</label>
                    <input
                      type="text"
                      required
                      value={compInd}
                      onChange={(e) => setCompInd(e.target.value)}
                      placeholder="Technology"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Headquarters Location</label>
                  <input
                    type="text"
                    required
                    value={compLoc}
                    onChange={(e) => setCompLoc(e.target.value)}
                    placeholder="Mumbai, India"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCreateCompanyOpen(false)}
                    className="flex-1 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingComp}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-1"
                  >
                    {creatingComp && <Clock className="h-4.5 w-4.5 animate-spin" />}
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE INTERVIEW MODAL */}
      <AnimatePresence>
        {schedulingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-lg w-full p-6 md:p-8 rounded-3xl relative overflow-hidden"
            >
              <h2 className="text-xl font-bold mb-1">Schedule Interview Call</h2>
              <p className="text-xs text-gray-400 mb-6">Applicant: <strong>{schedulingApp.applicant.name}</strong></p>

              <form onSubmit={handleScheduleInterview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 text-sm focus:outline-none text-gray-300 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Interview Type</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none cursor-pointer text-gray-300"
                    >
                      <option value="Technical" className="bg-[#0b0b0f]">Technical</option>
                      <option value="HR" className="bg-[#0b0b0f]">HR</option>
                      <option value="Phone" className="bg-[#0b0b0f]">Phone</option>
                      <option value="Panel" className="bg-[#0b0b0f]">Panel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Meeting Call Link</label>
                    <input
                      type="url"
                      value={interviewLink}
                      onChange={(e) => setInterviewLink(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm focus:outline-none text-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preparational Notes for Candidate</label>
                  <textarea
                    rows={3}
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    placeholder="Bring copy of code portfolio..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 text-sm focus:outline-none resize-none text-gray-300"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSchedulingApp(null)}
                    className="flex-1 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInterview}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {submittingInterview && <Clock className="h-4 w-4 animate-spin" />}
                    Confirm Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default RecruiterDashboard;
