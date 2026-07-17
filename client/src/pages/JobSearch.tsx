import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import api from '../services/api';
import { JobCardSkeleton } from '../components/Skeletons';
import toast from 'react-hot-toast';
import { 
  Search, MapPin, Briefcase, DollarSign, Bookmark, Share2, 
  ChevronRight, Calendar, Building, BookOpen, User, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
    location: string;
    industry: string;
    ratings: { average: number; count: number };
  };
  recruiter: {
    name: string;
    email: string;
  };
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary';
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  skillsRequired: string[];
  responsibilities?: string[];
  benefits?: string[];
  datePosted: string;
}

const JobSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Search filter states
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [workMode, setWorkMode] = useState('');
  const [type, setType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [sort, setSort] = useState('newest');

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applying, setApplying] = useState(false);

  // Load jobs matching queries
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (q) params.q = q;
      if (location) params.location = location;
      if (workMode) params.workMode = workMode;
      if (type) params.type = type;
      if (experienceLevel) params.experienceLevel = experienceLevel;
      if (sort) params.sort = sort;

      const res = await api.get('/jobs', { params });
      setJobs(res.data.jobs);
      if (res.data.jobs.length > 0) {
        setSelectedJob(res.data.jobs[0]);
      } else {
        setSelectedJob(null);
      }
    } catch (error: any) {
      toast.error('Could not fetch jobs dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams, workMode, type, experienceLevel, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q, location });
  };

  const handleBookmark = async (jobId: string) => {
    if (!isAuthenticated) return toast.error('Please login to bookmark jobs.');
    try {
      const res = await api.post(`/jobs/${jobId}/bookmark`);
      toast.success(res.data.message);
    } catch (error: any) {
      toast.error('Action failed.');
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Login to apply to this job.');
    if (!resumeUrl && !user?.seekerProfile?.resumeUrl) {
      return toast.error('Please provide a resume URL.');
    }

    setApplying(true);
    try {
      await api.post(`/applications/job/${selectedJob?._id}`, {
        resumeUrl: resumeUrl || user?.seekerProfile?.resumeUrl,
        coverLetter,
      });
      toast.success('Your application was submitted successfully!');
      setApplyModalOpen(false);
      setCoverLetter('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Search Bar Form */}
      <form onSubmit={handleSearchSubmit} className="glass p-3 rounded-2xl border-white/5 flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full px-2">
          <Search className="h-5 w-5 text-gray-500 shrink-0" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Job title, keywords, skill..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500 text-white"
          />
        </div>
        <div className="w-full md:w-px h-px md:h-6 bg-white/10 shrink-0" />
        <div className="flex items-center gap-2 w-full px-2">
          <MapPin className="h-5 w-5 text-gray-500 shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Remote, Country..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500 text-white"
          />
        </div>
        <button type="submit" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer transition-all">
          Search
        </button>
      </form>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[70vh]">
        
        {/* Filters and Left Listings (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Quick Filters */}
          <div className="glass p-4 rounded-2xl border-white/5 flex flex-wrap gap-2 items-center justify-between">
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none text-gray-300 cursor-pointer"
            >
              <option value="">Work Mode</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none text-gray-300 cursor-pointer"
            >
              <option value="">Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none text-gray-300 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="salary">Sort: Salary</option>
              <option value="views">Sort: Views</option>
            </select>
          </div>

          {/* Job List container */}
          <div className="space-y-3 overflow-y-auto max-h-[75vh] pr-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)
            ) : jobs.length === 0 ? (
              <div className="glass p-8 rounded-2xl text-center border-white/5 text-gray-400">
                No active jobs matching filters.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className={`glass-card p-5 rounded-2xl cursor-pointer border transition-all ${
                    selectedJob?._id === job._id ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5'
                  }`}
                >
                  <div className="flex gap-3 justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-gray-500" />
                        {job.company.name}
                      </p>
                    </div>
                    {job.company.logo && (
                      <img src={job.company.logo} alt={job.company.name} className="w-10 h-10 rounded-xl object-cover" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-indigo-400 font-semibold">{job.workMode}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-indigo-400 font-semibold">{job.type}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400">{job.experienceLevel}</span>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 text-xs text-gray-400">
                    <span>₹{job.salaryMin ? (job.salaryMin / 100000).toFixed(1) : '2'}L - ₹{job.salaryMax ? (job.salaryMax / 100000).toFixed(1) : '5'}L / yr</span>
                    <span>{new Date(job.datePosted).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Job Detailed Panel (7 columns) */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div
                key={selectedJob._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto sticky top-24"
              >
                {/* Header banner */}
                <div className="flex gap-4 items-start justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-white">{selectedJob.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5"><Building className="h-4 w-4 text-indigo-400" />{selectedJob.company.name}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-indigo-400" />{selectedJob.location} ({selectedJob.workMode})</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookmark(selectedJob._id)}
                      className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 text-gray-400 hover:text-indigo-400 transition-all cursor-pointer"
                      title="Bookmark"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Sub details block */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Experience</span>
                    <p className="text-sm font-semibold text-gray-200">{selectedJob.experienceLevel}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Job Type</span>
                    <p className="text-sm font-semibold text-indigo-400">{selectedJob.type}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Offered Salary</span>
                    <p className="text-sm font-semibold text-gray-200">₹{selectedJob.salaryMin?.toLocaleString()} - ₹{selectedJob.salaryMax?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Posted On</span>
                    <p className="text-sm font-semibold text-gray-200">{new Date(selectedJob.datePosted).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider">Required Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skillsRequired.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/10 text-xs text-indigo-400 font-semibold">{skill}</span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider">Job Description</h3>
                  <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {/* Responsibilities */}
                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider">Responsibilities</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1.5">
                      {selectedJob.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Action */}
                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) return toast.error('Please login to apply.');
                      setApplyModalOpen(true);
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer text-center"
                  >
                    Apply Now
                  </button>
                  <Link
                    to={`/chat`}
                    className="px-5 py-3 border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    Chat with Recruiter
                  </Link>
                </div>

              </motion.div>
            ) : (
              <div className="glass rounded-3xl border-white/5 p-8 text-center text-gray-400 h-full flex flex-col items-center justify-center">
                <Briefcase className="h-10 w-10 text-indigo-500/50 mb-3" />
                Select a job posting to view full details.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Apply Form Modal Drawer */}
      <AnimatePresence>
        {applyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-lg w-full p-6 md:p-8 rounded-3xl relative overflow-hidden"
            >
              <h2 className="text-xl font-bold mb-1">Easy Apply: {selectedJob?.title}</h2>
              <p className="text-xs text-gray-400 mb-6">Submitted details will go directly to {selectedJob?.company.name}</p>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resume URL / Link</label>
                  <input
                    type="text"
                    required
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or Cloudinary link"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  {user?.seekerProfile?.resumeUrl && (
                    <button
                      type="button"
                      onClick={() => setResumeUrl(user.seekerProfile?.resumeUrl || '')}
                      className="text-[10px] text-indigo-400 mt-1 hover:underline text-left block"
                    >
                      Autofill profile resume: {user.seekerProfile.resumeUrl.slice(0, 40)}...
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cover Letter / Pitch (Optional)</label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly pitch yourself for this role..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-sm font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 py-2.5 text-sm font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
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

export default JobSearch;
