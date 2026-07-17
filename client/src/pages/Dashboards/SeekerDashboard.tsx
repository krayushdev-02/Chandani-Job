import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { updateUserProfile } from '../../store/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  User, Briefcase, Settings, MapPin, ExternalLink, Calendar, X 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Application {
  _id: string;
  job: {
    title: string;
    location: string;
    company: { name: string; logo?: string };
  };
  status: string;
  createdAt: string;
  interviewSchedule?: {
    date: string;
    type: string;
    link?: string;
    notes?: string;
  };
}

const SeekerDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'applications' | 'profile' | 'interviews'>('applications');

  // Dashboard dataset states
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Seeker edit profile states
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.seekerProfile?.title || '');
  const [skillsText, setSkillsText] = useState('');
  const [skills, setSkills] = useState<string[]>(user?.seekerProfile?.skills || []);
  const [experienceYears, setExperienceYears] = useState(user?.seekerProfile?.experienceYears || 0);
  const [education, setEducation] = useState(user?.seekerProfile?.education || '');
  const [resumeUrl, setResumeUrl] = useState(user?.seekerProfile?.resumeUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.seekerProfile?.portfolioUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.seekerProfile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.seekerProfile?.linkedinUrl || '');
  const [about, setAbout] = useState(user?.seekerProfile?.about || '');
  const [saving, setSaving] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/seeker');
      setApplications(res.data.applications);
    } catch (error) {
      toast.error('Failed to retrieve applications pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillsText.trim()) {
      e.preventDefault();
      if (!skills.includes(skillsText.trim())) {
        setSkills([...skills, skillsText.trim()]);
      }
      setSkillsText('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        title,
        skills,
        experienceYears,
        education,
        resumeUrl,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        about,
      });

      dispatch(updateUserProfile(res.data.user));
      toast.success('Your profile was updated successfully!');
    } catch (error: any) {
      toast.error('Could not save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  // Filter scheduled interviews
  const interviews = applications.filter(app => app.status === 'Interviewing' && app.interviewSchedule);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Profile Sidebar Summary Card (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
            
            <div className="w-20 h-20 bg-indigo-600/10 border-2 border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-indigo-400" />
            </div>

            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-indigo-400 font-medium mt-1">{user?.seekerProfile?.title || 'Job Seeker'}</p>

            <div className="flex justify-around items-center pt-6 mt-6 border-t border-white/5 text-xs">
              <div className="text-center">
                <span className="block text-xl font-extrabold text-white">{applications.length}</span>
                <span className="text-gray-500 font-semibold uppercase">Applied</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="text-center">
                <span className="block text-xl font-extrabold text-indigo-400">{interviews.length}</span>
                <span className="text-gray-500 font-semibold uppercase">Interviews</span>
              </div>
            </div>

            {/* Profile Completion indicator */}
            <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-400">Profile Completion</span>
                <span className="text-indigo-400">{user?.profileCompleted ? '100%' : '30%'}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500" 
                  style={{ width: user?.profileCompleted ? '100%' : '30%' }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Tab selection boxes */}
          <div className="glass p-2.5 rounded-2xl border-white/5 space-y-1">
            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'applications' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Briefcase className="h-4.5 w-4.5" />
              My Applications
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'interviews' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              Scheduled Interviews ({interviews.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              Edit Profile Detail
            </button>
          </div>
        </div>

        {/* Right Dashboard Details View Area (8 columns) */}
        <div className="lg:col-span-8">
          
          {/* TAB 1: Applications Pipeline */}
          {activeTab === 'applications' && (
            <div className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold">Applications Pipeline</h3>
              
              {loading ? (
                <div className="text-center py-10 text-gray-400">Loading pipeline...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="h-10 w-10 text-indigo-500/30 mx-auto mb-3" />
                  You haven't submitted any job applications yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app._id} className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-white text-base">{app.job.title}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{app.job.location}</span>
                          <span>Company: <strong>{app.job.company.name}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          app.status === 'Offered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                          app.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                          app.status === 'Shortlisted' || app.status === 'Interviewing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                          'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Scheduled Interviews */}
          {activeTab === 'interviews' && (
            <div className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold">Scheduled Interviews</h3>

              {interviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-10 w-10 text-indigo-500/30 mx-auto mb-3" />
                  No upcoming interviews scheduled yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.map((app) => (
                    <div key={app._id} className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-base">{app.job.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{app.job.company.name}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-500/15 text-amber-400 rounded-lg text-xs font-semibold uppercase">{app.interviewSchedule?.type} Interview</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Date & Time</span>
                          <p className="text-gray-200 font-medium">{app.interviewSchedule?.date ? new Date(app.interviewSchedule.date).toLocaleString() : ''}</p>
                        </div>
                        <div className="space-y-0.5 font-medium">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Meeting Link</span>
                          {app.interviewSchedule?.link ? (
                            <a 
                              href={app.interviewSchedule.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              Join Call <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <p className="text-gray-500">Provided closer to date</p>
                          )}
                        </div>
                      </div>

                      {app.interviewSchedule?.notes && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Recruiter Notes</span>
                          <p className="text-xs text-gray-400 leading-relaxed">{app.interviewSchedule.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Edit Profile Detail Form */}
          {activeTab === 'profile' && (
            <motion.form 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              onSubmit={handleProfileSubmit} 
              className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6"
            >
              <h3 className="text-xl font-bold">Edit Profile Detail</h3>

              {/* Grid profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Professional Headline</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="React & TypeScript Frontend Engineer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* About section */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About / Executive Summary</label>
                <textarea
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Detail your career achievements, tech specialization, and professional summary..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Skills text input tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tech Skills Tags</label>
                <div className="glass p-2.5 border border-white/10 rounded-xl flex flex-wrap gap-2 items-center">
                  {skills.map((skill, index) => (
                    <span key={index} className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-xs text-indigo-400 font-semibold flex items-center gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(index)} className="hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Press enter to add skills..."
                    className="bg-transparent border-none outline-none text-sm placeholder-gray-500 text-white min-w-[150px] p-1"
                  />
                </div>
              </div>

              {/* Grid 2: Experience & education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Experience Years</label>
                  <input
                    type="number"
                    min={0}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Education / Degree</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="B.Tech Computer Science"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Links & portfolio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Resume link</label>
                  <input
                    type="text"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* GitHub & Portfolio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Portfolio Website URL</label>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {saving && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
                  Save Profile Changes
                </button>
              </div>

            </motion.form>
          )}

        </div>

      </div>
    </div>
  );
};

export default SeekerDashboard;
