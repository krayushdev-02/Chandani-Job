import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Sparkles, BrainCircuit, UserCheck, MessageSquare, 
  Send, RefreshCw, Award, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Question {
  questionId: number;
  question: string;
  type: string;
  idealAnswerOutline: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  guidance?: { suggestedRoles: string[]; learningPath: string[]; marketTrends: string };
}

const AICenter: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'coach' | 'counselor'>('coach');

  // COUNSELOR STATE
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { sender: 'ai', text: 'Hello! I am your AI Career Counselor. Tell me your tech stack skills or fields you want to learn, and I will outline specialized learning paths and current job trends for you!' }
  ]);
  const [sendingChat, setSendingChat] = useState(false);

  // COACH STATE
  const [jobTitle, setJobTitle] = useState('React Frontend Developer');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Active Question evaluation
  const [answerInput, setAnswerInput] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string; modelAnswer: string } | null>(null);

  // Score accumulation
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  // ----------------------------------------------------
  // Counselor Logic
  // ----------------------------------------------------
  const handleCounselorSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setSendingChat(true);

    try {
      const res = await api.post('/ai/career-guidance', {
        skills: userMsg.split(','),
        interests: []
      });

      const responseText = `Here is your customized career mapping. Below you will find recommended roles, a detailed checklist learning path, and structural market trends:`;
      
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: responseText,
        guidance: {
          suggestedRoles: res.data.suggestedRoles,
          learningPath: res.data.learningPath,
          marketTrends: res.data.marketTrends
        }
      }]);
    } catch (error) {
      toast.error('Failed to connect with counselor.');
    } finally {
      setSendingChat(false);
    }
  };

  // ----------------------------------------------------
  // Coach Logic
  // ----------------------------------------------------
  const startInterview = async () => {
    if (!jobTitle.trim()) return toast.error('Please specify a job title.');

    setLoadingQuestions(true);
    setFinished(false);
    setScores([]);
    setCurrentIdx(0);
    setEvaluation(null);
    setAnswerInput('');

    try {
      const res = await api.post('/ai/interview-questions', { jobTitle });
      setQuestions(res.data.questions);
      toast.success('AI questions generated!');
    } catch (error) {
      toast.error('Failed to generate mock questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitAnswer = async () => {
    if (!answerInput.trim()) return toast.error('Please write an answer response.');

    setEvaluating(true);
    try {
      const activeQ = questions[currentIdx];
      const res = await api.post('/ai/evaluate-answer', {
        question: activeQ.question,
        answer: answerInput,
      });

      setEvaluation({
        score: res.data.score,
        feedback: res.data.feedback,
        modelAnswer: res.data.modelAnswer
      });

      setScores(prev => [...prev, res.data.score]);
      toast.success('AI Evaluation complete!');
    } catch (error) {
      toast.error('Failed to audit answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    setEvaluation(null);
    setAnswerInput('');
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
    }
  };

  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="glass p-6 rounded-3xl border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            AI Career and Interview Workspace
          </h2>
          <p className="text-sm text-gray-400 mt-1">Acquire insights from the career counselor and practice with real-time feedback</p>
        </div>
      </div>

      {/* Selector Options */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveModule('coach')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeModule === 'coach' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          AI Mock Coach
        </button>
        <button
          onClick={() => setActiveModule('counselor')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeModule === 'counselor' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Career Counselor
        </button>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[60vh]">
        
        {/* Module Content (8 columns) */}
        <div className="lg:col-span-8">
          
          {/* ==================================================== */}
          {/* 1. MOCK INTERVIEW COACH */}
          {/* ==================================================== */}
          {activeModule === 'coach' && (
            <div className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6">
              
              {questions.length === 0 ? (
                // Coach Config Setup
                <div className="space-y-6 max-w-md mx-auto text-center py-10">
                  <BrainCircuit className="h-12 w-12 text-indigo-500/50 mx-auto mb-2" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">Launch AI Simulator</h3>
                    <p className="text-xs text-gray-400">Configure the role you are preparing for to get highly tailored mock questions.</p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Node Developer"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:border-indigo-500 focus:outline-none"
                    />

                    <button
                      onClick={startInterview}
                      disabled={loadingQuestions}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-sm font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loadingQuestions && <RefreshCw className="h-4.5 w-4.5 animate-spin" />}
                      Start Simulator Session
                    </button>
                  </div>
                </div>
              ) : finished ? (
                // Interview Completed Screen
                <div className="text-center py-12 max-w-md mx-auto space-y-6">
                  <Award className="h-16 w-16 text-indigo-400 mx-auto animate-bounce" />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Simulator Concluded!</h3>
                    <p className="text-sm text-gray-400">Review your compiled performance scorecard below.</p>
                  </div>

                  <div className="glass p-6 rounded-2xl border-white/5 space-y-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Average Accuracy</span>
                    <h4 className="text-4xl font-black text-indigo-400">{averageScore}%</h4>
                  </div>

                  <button
                    onClick={() => setQuestions([])}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold py-3 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Start Another Mock Session
                  </button>
                </div>
              ) : (
                // Active Interview Question Cards
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-xs text-gray-400 border-b border-white/5 pb-3">
                    <span>Question {currentIdx + 1} of {questions.length}</span>
                    <span className="px-2 py-0.5 bg-indigo-600/10 text-indigo-400 rounded-md font-semibold uppercase">{questions[currentIdx].type}</span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white leading-relaxed">{questions[currentIdx].question}</h3>
                  </div>

                  {!evaluation ? (
                    // Answer textbox
                    <div className="space-y-4">
                      <textarea
                        rows={6}
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        placeholder="Type your response answer here..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                      />

                      <div className="flex justify-between">
                        <button
                          onClick={() => setQuestions([])}
                          className="px-4 py-2 border border-white/10 text-xs rounded-xl hover:bg-white/5 text-gray-400"
                        >
                          Quit
                        </button>
                        <button
                          onClick={submitAnswer}
                          disabled={evaluating}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {evaluating && <RefreshCw className="h-4 w-4 animate-spin" />}
                          Evaluate Answer
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Evaluation Feedback view
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5 border-t border-white/5 pt-4"
                    >
                      <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="text-center">
                          <span className="block text-[10px] text-gray-500 font-bold uppercase">Accuracy</span>
                          <span className="text-2xl font-black text-indigo-400">{evaluation.score}%</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <p className="text-xs text-gray-300 leading-relaxed pl-2">{evaluation.feedback}</p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggested Model Answer Outline</h4>
                        <p className="text-xs text-gray-400 leading-relaxed bg-white/5 p-4 rounded-xl font-mono">{evaluation.modelAnswer}</p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={nextQuestion}
                          className="bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-1 shadow-lg cursor-pointer"
                        >
                          Proceed <ChevronRight className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. CAREER COUNSELOR */}
          {/* ==================================================== */}
          {activeModule === 'counselor' && (
            <div className="glass rounded-3xl border-white/5 p-6 md:p-8 space-y-6 flex flex-col h-[70vh]">
              <h3 className="text-xl font-bold">Interactive Career Counselor</h3>

              {/* Chat log */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                      msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'glass border-white/5 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>

                      {msg.guidance && (
                        <div className="space-y-4 border-t border-white/10 pt-3">
                          {/* Suggested Roles */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase block">Recommended Roles</span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.guidance.suggestedRoles.map(r => (
                                <span key={r} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 font-semibold rounded text-[10px]">{r}</span>
                              ))}
                            </div>
                          </div>

                          {/* Checklists learning path */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-gray-500 font-bold uppercase block">Structured Learning Checklist</span>
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-400">
                              {msg.guidance.learningPath.map((path, idx) => (
                                <li key={idx}>{path}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Market trends */}
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase block">Current Market Trends</span>
                            <p className="text-[11px] text-gray-400 italic leading-normal">"{msg.guidance.marketTrends}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleCounselorSend} className="glass p-1.5 border border-white/5 rounded-xl flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  disabled={sendingChat}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="e.g. React, Node.js, interested in cloud microservices..."
                  className="bg-transparent border-none outline-none text-xs px-3 py-2 w-full text-white placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={sendingChat}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 rounded-lg text-white transition-all shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Info panel (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              Platform Guide
            </h4>
            <ul className="space-y-3 text-xs text-gray-400 leading-relaxed">
              <li>
                <strong>Mock Coach</strong> evaluates details using natural language parsing to score answers against standardized interview structures.
              </li>
              <li>
                <strong>Career Counselor</strong> analyzes your skills list to output custom learning roadmaps and market stats.
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AICenter;
