import React, { useState } from 'react';
import { Code, Play, CheckCircle2, Copy } from 'lucide-react';

export const RestApiBrowser: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/employees');
  const [responseJson, setResponseJson] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const endpoints = [
    { method: 'GET', url: '/api/hospitals', desc: 'Fetch multi-hospital branch directory' },
    { method: 'GET', url: '/api/employees', desc: 'List active medical staff & credentials' },
    { method: 'GET', url: '/api/rosters', desc: 'Fetch ICU & Emergency ward shift rosters' },
    { method: 'POST', url: '/api/ai/assistant', desc: 'Invoke AuraAI Gemini assistant' },
    { method: 'POST', url: '/api/ai/rank-candidates', desc: 'Invoke AI Candidate Ranker' },
  ];

  const handleTestApi = async () => {
    setLoading(true);
    try {
      if (selectedEndpoint.startsWith('/api/ai/')) {
        const res = await fetch(selectedEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Summarize ICU nurse compliance rules' }),
        });
        const data = await res.json();
        setResponseJson(JSON.stringify(data, null, 2));
      } else {
        const res = await fetch(selectedEndpoint);
        const data = await res.json();
        setResponseJson(JSON.stringify(data, null, 2));
      }
    } catch (e) {
      setResponseJson(JSON.stringify({ error: 'Failed to reach endpoint' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Code className="h-6 w-6 text-emerald-600" />
          AuraHR Live REST API Explorer & Developer Sandbox
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Interactive REST API endpoints for external Hospital EHR integration, AI endpoints, and webhook dispatching.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Endpoints List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Available Endpoints</h3>
          {endpoints.map((ep) => (
            <div
              key={ep.url}
              onClick={() => setSelectedEndpoint(ep.url)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                selectedEndpoint === ep.url
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {ep.method}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{ep.url}</span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">{ep.desc}</p>
            </div>
          ))}

          <button
            onClick={handleTestApi}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
          >
            <Play className="h-4 w-4" /> Execute Live Request ({selectedEndpoint})
          </button>
        </div>

        {/* Live Response Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-emerald-400 shadow-sm font-mono text-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Response JSON (HTTP 200 OK)</span>
              <span className="text-[10px] text-emerald-500">Content-Type: application/json</span>
            </div>
            <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed text-[11px]">
              {loading ? 'Executing REST API request...' : responseJson || '// Click "Execute Live Request" to inspect JSON output'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
