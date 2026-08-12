import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Server,
  X,
  Eye,
  Inbox,
  Clock,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

interface DispatchedEmail {
  id: string;
  dispatchId: string;
  channel: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  body: string;
  html?: string;
  status: 'DELIVERED' | 'QUEUED' | 'FAILED';
  previewUrl?: string | false;
  timestamp: string;
  smtpServer: string;
}

interface EmailDispatchConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailDispatchConsoleModal: React.FC<EmailDispatchConsoleModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useHrms();
  const [emails, setEmails] = useState<DispatchedEmail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<DispatchedEmail | null>(null);

  // Test Dispatch Form state
  const [testRecipient, setTestRecipient] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('attasam223@gmail.com');
  const [testSubject, setTestSubject] = useState<string>('Test AuraHR Realtime Email Dispatch');
  const [testMessage, setTestMessage] = useState<string>('This is a real-time SMTP dispatch test sent via AuraHR Healthcare HRMS.');
  const [isSending, setIsSending] = useState<boolean>(false);

  const fetchDispatchedEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications/dispatched-emails');
      const data = await res.json();
      if (data.success && Array.isArray(data.emails)) {
        setEmails(data.emails);
      }
    } catch (err) {
      console.error('Failed to fetch dispatched emails', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchDispatchedEmails();
      const interval = setInterval(fetchDispatchedEmails, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient || !testRecipient.includes('@')) {
      showToast('error', 'Invalid Email', 'Please enter a valid recipient email address.');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'Email',
          recipient: testRecipient,
          subject: testSubject,
          message: testMessage,
          senderEmail: senderEmail || 'attasam223@gmail.com',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Email Dispatched Live!', `Sent test email to ${testRecipient}. ID: ${data.dispatchId}`);
        fetchDispatchedEmails();
      } else {
        showToast('error', 'Dispatch Failed', data.error || 'Failed to dispatch test email.');
      }
    } catch (err: any) {
      showToast('error', 'Dispatch Exception', err.message || 'Error executing SMTP request.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearOutbox = async () => {
    try {
      await fetch('/api/notifications/clear-emails', { method: 'POST' });
      setEmails([]);
      setSelectedEmail(null);
      showToast('info', 'Outbox Cleared', 'Dispatched email log queue has been reset.');
    } catch (err) {
      showToast('error', 'Failed to clear outbox');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90vh] w-full max-w-5xl flex-col rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden cursor-default"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Realtime SMTP Email Dispatch Console</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Relay
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitor live SMTP dispatches, test credentials delivery, and view outbox logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDispatchedEmails}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 text-xs font-bold transition border border-slate-700"
              title="Refresh Outbox"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleClearOutbox}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 text-xs font-bold transition border border-rose-500/20"
              title="Clear Outbox Logs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 text-xs font-bold transition border border-slate-700"
              title="Close Console (Esc)"
            >
              <X className="h-4 w-4 text-slate-400" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Main Content Split: Left Form / Top Controls + Right Outbox List & Preview */}
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Test Email Dispatcher & Security Stats (5 Cols) */}
          <div className="lg:col-span-5 border-r border-slate-800 p-6 overflow-y-auto bg-slate-900/50 space-y-6">
            {/* Quick Test Dispatcher Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-inner">
              <h4 className="flex items-center gap-2 font-bold text-sm text-slate-200 mb-3">
                <Send className="h-4 w-4 text-emerald-400" />
                Dispatch Live Test Email
              </h4>
              <form onSubmit={handleSendTestEmail} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Dispatching Sender Email
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                    placeholder="attasam223@gmail.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-emerald-400 font-mono font-semibold placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. nurse.johnson@stjudehealth.org"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={3}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Dispatching via SMTP...' : 'Dispatch Live Email Now'}
                </button>
              </form>
            </div>

            {/* SMTP Relay Technical Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-2">
              <h5 className="font-bold text-slate-300 flex items-center gap-1.5 text-xs mb-2">
                <Server className="h-3.5 w-3.5 text-blue-400" />
                Active SMTP Relay Configuration
              </h5>
              <div className="flex justify-between text-slate-400 py-1 border-b border-slate-800/80">
                <span>Relay Server:</span>
                <span className="font-mono text-emerald-400 font-semibold">mail.aurahr.health (TLS/587)</span>
              </div>
              <div className="flex justify-between text-slate-400 py-1 border-b border-slate-800/80">
                <span>Domain Auth:</span>
                <span className="font-mono text-slate-200">DKIM & SPF Verified</span>
              </div>
              <div className="flex justify-between text-slate-400 py-1 border-b border-slate-800/80">
                <span>Default Sender:</span>
                <span className="font-mono text-emerald-400 font-semibold">{senderEmail || 'attasam223@gmail.com'}</span>
              </div>
              <div className="flex justify-between text-slate-400 py-1">
                <span>Realtime Poll Interval:</span>
                <span className="font-mono text-amber-400 font-bold">3 Seconds</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Dispatched Email Queue & Inbox Preview (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-slate-900/80">
            {/* Outbox Count Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Inbox className="h-4 w-4 text-emerald-400" />
                Dispatched Outbox Log ({emails.length})
              </span>
              <span className="text-[11px] text-slate-500">
                Click any email to expand details
              </span>
            </div>

            {/* Email List or Selected Detail View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 p-6">
                  <Inbox className="h-12 w-12 text-slate-700 mb-3" />
                  <p className="font-bold text-sm text-slate-400">No Dispatched Emails Yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Send portal invitations, staff credentials, or use the live test dispatcher on the left to trigger real-time SMTP emails.
                  </p>
                </div>
              ) : (
                emails.map((mail) => (
                  <div
                    key={mail.id}
                    onClick={() => setSelectedEmail(selectedEmail?.id === mail.id ? null : mail)}
                    className={`rounded-2xl border p-4 transition cursor-pointer ${
                      selectedEmail?.id === mail.id
                        ? 'border-emerald-500/80 bg-slate-950/90 shadow-xl ring-1 ring-emerald-500/30'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                          mail.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate">{mail.subject}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            To: <span className="text-slate-200 font-semibold">{mail.recipientName ? `${mail.recipientName} <${mail.recipientEmail}>` : mail.recipientEmail}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-black">
                          {mail.status}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(mail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Detail View */}
                    {selectedEmail?.id === mail.id && (
                      <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-3 animate-in fade-in duration-150">
                        <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-1">
                          <p className="text-slate-400"><strong>Dispatch ID:</strong> <code className="text-emerald-400">{mail.dispatchId}</code></p>
                          <p className="text-slate-400"><strong>Sender:</strong> {mail.senderName} &lt;{mail.senderEmail}&gt;</p>
                          <p className="text-slate-400"><strong>SMTP Relay:</strong> {mail.smtpServer}</p>
                        </div>

                        <div>
                          <p className="font-bold text-slate-300 text-[11px] mb-1">Message Content:</p>
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {mail.body}
                          </div>
                        </div>

                        {mail.previewUrl && (
                          <div className="pt-2">
                            <a
                              href={mail.previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 shadow transition"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              View Live Ethereal Webmail Preview
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
