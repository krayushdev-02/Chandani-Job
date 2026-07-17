import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, Star, ArrowRight, BookOpen, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?q=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
  };

  const trendingSkills = ['React', 'Node.js', 'TypeScript', 'UI/UX', 'Python', 'Machine Learning'];

  const stats = [
    { label: 'Active Openings', value: '12,500+', icon: Briefcase },
    { label: 'Top Companies', value: '1,200+', icon: Users },
    { label: 'Average Match Rate', value: '87%', icon: Star },
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border-indigo-500/20 text-xs font-semibold text-indigo-400"
          >
            <BrainCircuit className="h-4 w-4" />
            AI-Powered Talent Matching Ecosystem
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none"
          >
            Connecting <span className="text-gradient">Talent</span> with <span className="text-gradient">Opportunity</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto font-medium"
          >
            Build ATS-optimized profiles, simulate real AI mock interviews, track workflows, and land your dream role in tech.
          </motion.p>

          {/* Animated Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onSubmit={handleSearch}
            className="glass p-2.5 rounded-2xl md:rounded-full border-white/5 flex flex-col md:flex-row items-center gap-3 shadow-2xl shadow-indigo-500/5 mt-8 w-full max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2.5 w-full px-3 py-1">
              <Search className="h-5 w-5 text-gray-500 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, keywords, or company..."
                className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500 text-white"
              />
            </div>
            <div className="w-full md:w-px h-px md:h-8 bg-white/10 shrink-0" />
            <div className="flex items-center gap-2.5 w-full px-3 py-1">
              <MapPin className="h-5 w-5 text-gray-500 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or Remote..."
                className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-500 text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold px-8 py-3 rounded-xl md:rounded-full shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
            >
              Search
            </button>
          </motion.form>

          {/* Trending Skills tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-2 pt-4"
          >
            <span className="text-xs text-gray-500 font-semibold uppercase">Popular Searches:</span>
            {trendingSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setKeyword(skill)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium hover:border-indigo-500/50 hover:text-indigo-400 transition-all"
              >
                {skill}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. Platform Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-3xl font-extrabold">{stat.value}</h3>
              </div>
              <div className="p-3 bg-indigo-600/10 rounded-xl">
                <stat.icon className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features Portal Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">AI Career Optimization Ecosystem</h2>
          <p className="text-gray-400 text-sm mt-2">Take advantage of premium intelligent services designed to fast-track matching.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Resume scoring */}
          <div className="glass-card p-8 rounded-3xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold">ATS Resume Reviewer</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Generate ATS scores against job descriptions instantly. Spot grammar flaws and format inconsistencies, and write professional STAR summaries.
              </p>
            </div>
            <Link to="/resume-builder" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Launch Builder <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 2: Interview simulator */}
          <div className="glass-card p-8 rounded-3xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold">AI Mock Interview Coach</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Rehearse with questions generated matching role details. Get structured scorecards, ideal answers, and speech tips from our intelligent model.
              </p>
            </div>
            <Link to="/ai-coach" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Rehearse Answers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 3: Resources */}
          <div className="glass-card p-8 rounded-3xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-600/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold">Expert Career Guides</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Gain strategic insights by reviewing blog articles covering standard MERN/cloud system designs, behavioral interview answers, and recruiter trends.
              </p>
            </div>
            <Link to="/blogs" className="inline-flex items-center gap-1 text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors">
              Read Guides <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Newsletter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 text-center md:text-left max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight">Stay updated with fresh roles</h2>
            <p className="text-sm text-gray-400">
              Subscribe to get personalized job alerts matching your skills, top recruiter highlights, and resume optimization tips directly in your inbox.
            </p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed successfully!'); }}
            className="flex w-full md:w-auto items-center gap-2 max-w-md shrink-0 bg-white/5 p-1.5 border border-white/5 rounded-xl"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="bg-transparent border-none outline-none px-3 text-sm placeholder-gray-500 w-full text-white"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold px-5 py-2.5 rounded-lg transition-all shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
