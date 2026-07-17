import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout, toggleTheme } from '../store/slices/authSlice';
import { 
  Briefcase, User, LogOut, Sun, Moon, Menu, X, 
  MessageSquare, Compass, Shield, CreditCard, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, theme } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'Super Admin') return '/admin';
    if (['Recruiter', 'Employer', 'HR Manager', 'Company Admin'].includes(user.role)) return '/recruiter-dashboard';
    return '/seeker-dashboard';
  };

  const navLinks = [
    { label: 'Find Jobs', path: '/jobs', icon: Compass },
    { label: 'AI Resume Builder', path: '/resume-builder', icon: Briefcase },
    { label: 'AI Coach', path: '/ai-coach', icon: User },
    { label: 'Pricing', path: '/pricing', icon: CreditCard },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 transition-colors duration-300 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Briefcase className="h-6 w-6 text-indigo-500" />
              <span>
                CHANDANDI<span className="text-indigo-500">JOBS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-2 rounded-lg text-sm font-medium hover:text-indigo-400 hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg hover:bg-white/5 transition-all text-gray-400 hover:text-indigo-400"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/chat"
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-indigo-400 transition-all relative"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  to={getDashboardLink()}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-sm font-medium hover:text-indigo-400 hover:bg-white/5 transition-all"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-white/5 px-4 pt-2 pb-4 space-y-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium hover:bg-white/5 hover:text-indigo-400 flex items-center gap-2"
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}

            <div className="border-t border-white/5 pt-3 mt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-base font-medium hover:bg-white/5 flex items-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Messages
                  </Link>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg bg-indigo-600 text-center text-base font-semibold shadow-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium hover:bg-red-500/10 text-red-400 flex items-center gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg border border-white/10 text-center text-base font-medium hover:bg-white/5"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg bg-indigo-600 text-center text-base font-semibold"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
