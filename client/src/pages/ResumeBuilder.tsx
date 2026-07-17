import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, Sparkles, ArrowDownToLine, 
  RefreshCw, CheckCircle2, Lightbulb 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  score: number;
  suggestions: string[];
  skillsGap: string[];
  optimizedSummary: string;
}

const ResumeBuilder: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobSkillsText, setJobSkillsText] = useState('React, TypeScript, Tailwind CSS, Node.js, Redux');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Resume Form Fields
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [email, setEmail] = useState('seeker@chandandijobs.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [experience, setExperience] = useState('Frontend Developer at TechCorps (2024-Present)\n- Built interactive UI dashboards with React and Redux.\n- Optimized client-side queries reducing API latencies by 15%.');
  const [education, setEducation] = useState('B.Tech in Computer Science - University of Delhi (2020-2024)');

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      return toast.error('Please paste or write your resume text details.');
    }

    setAnalyzing(true);
    try {
      const skillsArray = jobSkillsText.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/ai/analyze-resume', {
        resumeText,
        jobSkills: skillsArray,
      });

      setResult(res.data.analysis);
      toast.success('ATS resume analysis complete!');
    } catch (error) {
      toast.error('Failed to run AI analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const autofillFromForm = () => {
    const text = `
Name: ${fullName}
Email: ${email}
Phone: ${phone}

SUMMARY:
Experienced frontend software engineer specializing in web application development.

EDUCATION:
${education}

EXPERIENCE:
${experience}

SKILLS:
React, TypeScript, HTML, CSS, Javascript, Git
    `.trim();
    setResumeText(text);
    toast.success('Resume fields compiled into analyzer workspace!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      
      {/* Banner */}
      <div className="glass p-6 rounded-3xl border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            AI Resume Analyzer & ATS Optimizer
          </h2>
          <p className="text-sm text-gray-400 mt-1">Audit your resume matching job descriptions, spot skills gaps, and optimize formatting</p>
        </div>
      </div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Form and paste box (5 columns) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          
          {/* Quick template builder */}
          <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
            <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Quick Resume Generator</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white"
                />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white"
                />
              </div>
              <textarea
                rows={3}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Experience details..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 text-xs text-white resize-none"
              />
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Education / College"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3.5 text-xs text-white"
              />

              <button
                type="button"
                onClick={autofillFromForm}
                className="w-full py-2 bg-indigo-600/15 hover:bg-indigo-600/35 border border-indigo-500/25 rounded-xl text-xs font-semibold text-indigo-400 transition-all cursor-pointer"
              >
                Compile into Analyzer Workspace
              </button>
            </div>
          </div>

          {/* Pasting area */}
          <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
            <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">ATS Match Workspace</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Compare Skills Requirements</label>
                <input
                  type="text"
                  value={jobSkillsText}
                  onChange={(e) => setJobSkillsText(e.target.value)}
                  placeholder="React, TypeScript, Redux..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-indigo-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Paste Resume Text</label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste complete raw text of your resume here to audit..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none resize-none font-mono"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-sm font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {analyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {analyzing ? 'Analyzing ATS Alignment...' : 'Verify ATS Match Score'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Score ring and suggestions / PDF preview printout (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Score panel */}
                <div className="glass p-6 md:p-8 rounded-3xl border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center print:hidden">
                  <div className="flex flex-col items-center">
                    {/* Circle Score bar */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" className="stroke-white/5 fill-transparent stroke-8" />
                        <circle 
                          cx="56" cy="56" r="48" 
                          className="stroke-indigo-500 fill-transparent stroke-8 transition-all duration-1000"
                          strokeDasharray={301.6}
                          strokeDashoffset={301.6 - (301.6 * result.score) / 100}
                        />
                      </svg>
                      <span className="absolute text-2xl font-black text-white">{result.score}%</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-3">ATS Score</span>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <h3 className="text-lg font-bold">ATS Compatibility Match</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your resume scoring sits at {result.score}%. An ATS score above 80% is highly competitive and ensures your profile passes automated filters into recruiting managers' hands.
                    </p>
                  </div>
                </div>

                {/* Local suggestions review */}
                <div className="glass p-6 rounded-3xl border-white/5 space-y-4 print:hidden">
                  <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="h-4.5 w-4.5 text-indigo-400" />
                    AI Optimization Suggestions
                  </h3>

                  <ul className="space-y-2.5 text-xs text-gray-400">
                    {result.suggestions.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  {result.skillsGap.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">Skills Gap Identified</span>
                      <div className="flex flex-wrap gap-1">
                        {result.skillsGap.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-red-500/10 border border-red-500/10 text-[10px] text-red-400 font-semibold rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* PDF Print preview layout */}
                <div className="glass p-8 rounded-3xl border-white/5 space-y-6 print:bg-white print:text-black print:border-none print:shadow-none">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 print:border-black/10">
                    <div>
                      <h2 className="text-2xl font-bold text-white print:text-black">{fullName}</h2>
                      <p className="text-xs text-gray-400 print:text-black/60 mt-0.5">{email} | {phone}</p>
                    </div>
                    <button
                      onClick={handleExportPDF}
                      className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer print:hidden"
                    >
                      <ArrowDownToLine className="h-4 w-4" /> Download PDF Resume
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] print:text-black">Executive Summary</h4>
                      <p className="text-gray-400 leading-relaxed print:text-black">{result.optimizedSummary}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] print:text-black">Professional Experience</h4>
                      <p className="text-gray-400 leading-relaxed whitespace-pre-wrap print:text-black">{experience}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] print:text-black">Education Background</h4>
                      <p className="text-gray-400 leading-relaxed print:text-black">{education}</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="glass rounded-3xl border-white/5 p-8 text-center text-gray-400 h-96 flex flex-col items-center justify-center">
                <FileText className="h-12 w-12 text-indigo-500/30 mb-3" />
                Fill the fields or paste your resume text on the left, then click verify to check ATS alignment.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default ResumeBuilder;
