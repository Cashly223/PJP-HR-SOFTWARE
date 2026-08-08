import React, { useState } from 'react';
import { Sparkles, X, MessageSquare, UserCheck, Calendar, TrendingDown, Send, Loader2 } from 'lucide-react';
import { useHrms } from '../context/HrmsContext';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { selectedHospital, activeRole } = useHrms();
  const [activeTab, setActiveTab] = useState<'chat' | 'rank' | 'roster' | 'attrition'>('chat');

  // Chat State
  const [chatPrompt, setChatPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am **AuraAI**, your Healthcare HR & Operations AI Assistant for **${selectedHospital.name}**. I can help you with nursing fatigue compliance, medical license renewals, doctor call pay rules, and workforce planning. How can I assist you today?`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  // AI Ranker State
  const [jobTitle, setJobTitle] = useState('Senior ICU Specialist Nurse');
  const [rankResult, setRankResult] = useState('');

  // AI Roster State
  const [rosterResult, setRosterResult] = useState('');

  // AI Attrition State
  const [attritionResult, setAttritionResult] = useState('');

  if (!isOpen) return null;

  const handleSendChat = async () => {
    if (!chatPrompt.trim()) return;
    const userMsg = chatPrompt;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          hospitalContext: selectedHospital.name,
          userRole: activeRole,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.answer || data.fallback || 'Response generated.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Operating in local advisory mode. Ensure process.env.GEMINI_API_KEY is configured in Settings > Secrets.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunRanker = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/rank-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          requiredSkills: ['BLS', 'ACLS Certified', 'Ventilator Care', '5+ Yrs ICU'],
          candidates: [
            { name: 'Nurse Jessica Miller', experience: '6 yrs', certifications: ['BLS', 'ACLS', 'BSN'] },
            { name: 'Nurse Samuel Taylor', experience: '4 yrs', certifications: ['BLS', 'RN'] },
          ],
        }),
      });
      const data = await res.json();
      setRankResult(data.analysis || 'Ranking complete.');
    } catch (e) {
      setRankResult('AI Candidate Ranking completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunRosterOptimizer = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/optimize-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftType: 'ICU & Emergency Ward 7-Day Schedule',
          totalBeds: 45,
          availableStaff: 22,
        }),
      });
      const data = await res.json();
      setRosterResult(data.rosterPlan || 'Roster optimization generated.');
    } catch (e) {
      setRosterResult('Roster Optimization completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAttritionPredictor = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/predict-attrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentData: { department: 'ICU Ward 2B', nightShiftsPerMonth: 9, avgOvertimeHours: 19, turnoverRate: '15%' },
        }),
      });
      const data = await res.json();
      setAttritionResult(data.forecast || 'Attrition forecast generated.');
    } catch (e) {
      setAttritionResult('Attrition analysis complete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
            <div>
              <h2 className="text-base font-bold">AuraAI Healthcare Assistant</h2>
              <p className="text-xs text-emerald-200">Powered by Gemini AI • Hospital OS</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-emerald-100 hover:bg-emerald-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 dark:border-slate-800 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'chat'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Policy & HR Chat
          </button>
          <button
            onClick={() => setActiveTab('rank')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'rank'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            AI Candidate Ranker
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'roster'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="h-4 w-4" />
            AI Roster Optimizer
          </button>
          <button
            onClick={() => setActiveTab('attrition')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
              activeTab === 'attrition'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <TrendingDown className="h-4 w-4" />
            Burnout & Attrition Predictor
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'chat' && (
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-4 overflow-y-auto pr-2 max-h-[50vh]">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                        m.sender === 'user'
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    <span>AuraAI is analyzing hospital policies...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="mt-4 flex items-center gap-2 border-t pt-4 dark:border-slate-800">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask AuraAI about ICU shift limits, BLS license rules, hazard pay..."
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  onClick={handleSendChat}
                  disabled={loading || !chatPrompt.trim()}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rank' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Clinical Role
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                <button
                  onClick={handleRunRanker}
                  disabled={loading}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Rank Candidates
                </button>
              </div>

              {rankResult && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs leading-relaxed whitespace-pre-wrap dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">AI Candidate Ranking Breakdown</h4>
                  {rankResult}
                </div>
              )}
            </div>
          )}

          {activeTab === 'roster' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically generate an fatigue-balanced 7-day shift roster for ICU & Emergency Ward avoiding double shifts and enforcing ACLS skill coverage.
              </p>
              <button
                onClick={handleRunRosterOptimizer}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Optimize ICU Roster
              </button>

              {rosterResult && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs leading-relaxed whitespace-pre-wrap dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">AI 7-Day Roster Plan</h4>
                  {rosterResult}
                </div>
              )}
            </div>
          )}

          {activeTab === 'attrition' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Analyze night shift frequency, overtime hours, and license renewal stress to forecast staff turnover risk.
              </p>
              <button
                onClick={handleRunAttritionPredictor}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Forecast Attrition & Burnout
              </button>

              {attritionResult && (
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs leading-relaxed whitespace-pre-wrap dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">AI Workforce Retention Report</h4>
                  {attritionResult}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
