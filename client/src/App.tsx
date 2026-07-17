import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store/store';
import { setCredentials, setLoading } from './store/slices/authSlice';
import api from './services/api';
import { Toaster } from 'react-hot-toast';

// Layout & Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobSearch from './pages/JobSearch';
import ResumeBuilder from './pages/ResumeBuilder';
import AICenter from './pages/AICenter';
import ChatRoom from './pages/ChatRoom';
import Pricing from './pages/Pricing';

// Dashboards
import SeekerDashboard from './pages/Dashboards/SeekerDashboard';
import RecruiterDashboard from './pages/Dashboards/RecruiterDashboard';
import AdminDashboard from './pages/Dashboards/AdminDashboard';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch(setLoading(false));
        return;
      }

      try {
        const res = await api.get('/auth/profile');
        dispatch(setCredentials({ token, user: res.data.user }));
      } catch (error) {
        localStorage.removeItem('token');
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  // Synchronize CSS class for light theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Authenticated Shared Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<ChatRoom />} />
              <Route path="/ai-coach" element={<AICenter />} />
            </Route>

            {/* Role Specific Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Job Seeker']} />}>
              <Route path="/seeker-dashboard" element={<SeekerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Recruiter', 'Employer', 'HR Manager', 'Company Admin']} />}>
              <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Super Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>

        <Footer />
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </Router>
  );
};

export default App;
