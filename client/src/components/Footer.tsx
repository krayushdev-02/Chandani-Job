import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, MapPin, Phone, Github, Linkedin, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass border-t border-white/5 pt-12 pb-6 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <Briefcase className="h-6 w-6 text-indigo-500" />
              <span>CHANDANDI<span className="text-indigo-500">JOBS</span></span>
            </Link>
            <p className="text-sm text-gray-400">
              Connecting Talent with Opportunity. Build ATS-friendly resumes, simulate AI mock interviews, and find premium career pathways.
            </p>
            <div className="flex space-x-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-indigo-600 rounded-lg hover:text-white transition-all text-gray-400">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-indigo-600 rounded-lg hover:text-white transition-all text-gray-400">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-indigo-600 rounded-lg hover:text-white transition-all text-gray-400">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Job Seekers Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">For Job Seekers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/jobs" className="hover:text-indigo-400 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/resume-builder" className="hover:text-indigo-400 transition-colors">AI Resume Builder</Link></li>
              <li><Link to="/ai-coach" className="hover:text-indigo-400 transition-colors">AI Interview Coach</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Premium Plans</Link></li>
            </ul>
          </div>

          {/* Recruiters / Employers Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Post a Job</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-400 transition-colors">Recruiter Subscription</Link></li>
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">Hiring Solutions</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4">Get In Touch</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Bettiah, Bihar, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
                <a href="mailto:ayushk2375@gmail.com" className="hover:text-indigo-400">ayushk2375@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>+91 123 456 7890</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-white/5 my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {currentYear} ChandandiJobs. Built with Trust by Ayush Kumar.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <Link to="/privacy-policy" className="hover:text-indigo-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-indigo-400">Terms & Conditions</Link>
            <Link to="/shipping-policy" className="hover:text-indigo-400">Shipping Details</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
