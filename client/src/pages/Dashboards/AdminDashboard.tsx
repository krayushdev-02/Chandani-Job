import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, Check, X 
} from 'lucide-react';

interface Analytics {
  totalUsers: number;
  totalSeekers: number;
  totalRecruiters: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalRevenue: number;
  recentApplications: Array<{
    _id: string;
    applicant: { name: string; email: string };
    job: { title: string };
    createdAt: string;
  }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  recruiterProfile?: { designation?: string; verificationStatus: string };
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications'>('overview');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const metricsRes = await api.get('/admin/analytics');
      setAnalytics(metricsRes.data.analytics);

      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to load admin stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyRecruiter = async (userId: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/admin/recruiters/${userId}/verify`, { verificationStatus: status });
      toast.success(`Recruiter verification set to ${status}`);
      fetchAdminData();
    } catch (error) {
      toast.error('Verification update failed.');
    }
  };

  const pendingRecruiters = users.filter(
    (u) => u.role === 'Recruiter' && u.recruiterProfile?.verificationStatus === 'Pending'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header title */}
      <div className="glass p-6 rounded-3xl border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Super Admin Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Monitor job platform statistics, verify recruiters, and audit system status</p>
        </div>
        <ShieldCheck className="h-10 w-10 text-indigo-500 shrink-0" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative ${
            activeTab === 'verifications' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          Verifications
          {pendingRecruiters.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 text-[10px] font-extrabold text-white flex items-center justify-center rounded-full animate-bounce">
              {pendingRecruiters.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Gaining access to system statistics...</div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass p-5 rounded-2xl border-white/5 space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Accounts</span>
                  <p className="text-2xl font-extrabold text-white">{analytics.totalUsers}</p>
                </div>
                <div className="glass p-5 rounded-2xl border-white/5 space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Active Listings</span>
                  <p className="text-2xl font-extrabold text-indigo-400">{analytics.activeJobs} / {analytics.totalJobs}</p>
                </div>
                <div className="glass p-5 rounded-2xl border-white/5 space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Applications</span>
                  <p className="text-2xl font-extrabold text-white">{analytics.totalApplications}</p>
                </div>
                <div className="glass p-5 rounded-2xl border-white/5 space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Platform Revenue</span>
                  <p className="text-2xl font-extrabold text-emerald-400">₹{analytics.totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Splitted panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent applications audit log */}
                <div className="glass rounded-3xl border-white/5 p-6 space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Recent Applications Audit</h3>
                  <div className="space-y-3">
                    {analytics.recentApplications.map((app) => (
                      <div key={app._id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-white">{app.applicant.name}</p>
                          <p className="text-gray-500">{app.applicant.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-indigo-400 font-medium">{app.job.title}</p>
                          <p className="text-[10px] text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Diagnostics */}
                <div className="glass rounded-3xl border-white/5 p-6 space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">System Diagnostics</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-gray-300">Database Core Connection</span>
                      <span className="text-emerald-400 font-bold uppercase">Online</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-gray-300">Socket.io Broadcast Node</span>
                      <span className="text-emerald-400 font-bold uppercase">Online</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-gray-300">AI Intelligence Microservice</span>
                      <span className="text-emerald-400 font-bold uppercase">Online</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: VERIFICATIONS */}
          {activeTab === 'verifications' && (
            <div className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-4">
              <h3 className="text-xl font-bold">Pending Recruiter Approvals</h3>

              {pendingRecruiters.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <ShieldCheck className="h-10 w-10 text-indigo-500/30 mx-auto mb-3" />
                  No pending recruiter verification requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRecruiters.map((rec) => (
                    <div key={rec._id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-base">{rec.name}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">Email: {rec.email}</p>
                        {rec.recruiterProfile?.designation && (
                          <p className="text-xs text-indigo-400 mt-1">Designation: <strong>{rec.recruiterProfile.designation}</strong></p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyRecruiter(rec._id, 'Approved')}
                          className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-xl text-white shadow transition-all cursor-pointer"
                          title="Approve"
                        >
                          <Check className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleVerifyRecruiter(rec._id, 'Rejected')}
                          className="bg-red-500/20 hover:bg-red-500/40 p-2 rounded-xl text-red-400 transition-all cursor-pointer"
                          title="Reject"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </>
      )}

    </div>
  );
};

export default AdminDashboard;
