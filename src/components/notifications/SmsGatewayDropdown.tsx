import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Smartphone,
  Send,
  CheckCircle2,
  Clock,
  Users,
  Search,
  AlertTriangle,
  RefreshCw,
  X,
  Copy,
  Check,
  Zap,
  Phone,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  Radio,
  FileText,
  Flame,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, StaffQuery } from '../../types/hrms';

export interface DispatchLogEntry {
  id: string;
  dispatchId: string;
  channel: 'SMS' | 'WhatsApp' | 'Dual (WhatsApp + SMS)';
  category: 'Emergency Call-In' | 'Disciplinary Query Alert' | 'Critical Shortage / Code Red' | 'Shift Swap Alert' | 'Custom Notice';
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  recipientDepartment: string;
  recipientRole: string;
  messageText: string;
  status: 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED' | 'FAILED';
  gatewayResponseId: string;
  dispatchedAt: string;
  dispatchedBy: string;
  whatsAppClickUrl?: string;
}

interface SmsGatewayDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullModal?: () => void;
}

export const SmsGatewayDropdown: React.FC<SmsGatewayDropdownProps> = ({
  isOpen,
  onClose,
  onOpenFullModal,
}) => {
  const {
    employees,
    staffQueries,
    currentUser,
    selectedHospital,
    showToast,
    currentUserDepartment,
  } = useHrms();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'outbox' | 'callin' | 'query' | 'quick_sms' | 'settings'>('outbox');

  // WhatsApp toggle state (Disabled by default for 100% pure Cellular SMS)
  const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState<boolean>(() => {
    return localStorage.getItem('hrms_gateway_enable_whatsapp') === 'true';
  });

  const toggleWhatsApp = (val: boolean) => {
    setIsWhatsAppEnabled(val);
    localStorage.setItem('hrms_gateway_enable_whatsapp', val ? 'true' : 'false');
    showToast(val ? 'WhatsApp enabled alongside SMS' : 'WhatsApp disabled. Pure GSM Cellular SMS active', 'info');
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Quick SMS State
  const [quickRecipientPhone, setQuickRecipientPhone] = useState<string>('');
  const [quickRecipientName, setQuickRecipientName] = useState<string>('');
  const [quickMessage, setQuickMessage] = useState<string>('PJPIIMC HR ALERT: Please report to your assigned unit supervisor.');
  const [quickStaffSelect, setQuickStaffSelect] = useState<string>('');

  // Quick Call-In State
  const [callInWard, setCallInWard] = useState<string>('Intensive Care Unit (ICU)');
  const [callInUrgency, setCallInUrgency] = useState<'Code Red - Immediate (30 min)' | 'High Priority (1-2 Hours)'>('Code Red - Immediate (30 min)');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [callInCompensation, setCallInCompensation] = useState<string>('Double Hazard Allowance (GH₵ 350) + 1.5x OT');

  // Query Alert State
  const [selectedQueryId, setSelectedQueryId] = useState<string>('');

  // Sample initial outbox logs
  const [logs, setLogs] = useState<DispatchLogEntry[]>([
    {
      id: 'LOG-SMS-901',
      dispatchId: 'DISP-SMS-8841',
      channel: 'SMS',
      category: 'Emergency Call-In',
      recipientId: 'EMP-001',
      recipientName: 'Dr. Sarah Mensah',
      recipientPhone: '+233 24 412 3456',
      recipientDepartment: 'Intensive Care Unit',
      recipientRole: 'Senior ICU Specialist',
      messageText: 'PJPIIMC URGENT: CODE RED SURGE coverage requested for ICU Floor 2. Relieve standby cover required immediately. Compensation: GH₵ 350 emergency hazard.',
      status: 'DELIVERED',
      gatewayResponseId: 'HUBTEL-SMS-OK-98124',
      dispatchedAt: '2 mins ago',
      dispatchedBy: currentUser?.name || 'HR Dispatcher',
    },
    {
      id: 'LOG-SMS-902',
      dispatchId: 'DISP-SMS-8842',
      channel: 'SMS',
      category: 'Disciplinary Query Alert',
      recipientId: 'EMP-004',
      recipientName: 'Nurse Emmanuel Darko',
      recipientPhone: '+233 50 198 7654',
      recipientDepartment: 'Emergency Medicine',
      recipientRole: 'Staff Nurse',
      messageText: 'FORMAL NOTICE: An official inquiry (QRY-2026-089) regarding Ward Medication Audit has been issued. Log into staff portal to respond within 48h.',
      status: 'DELIVERED',
      gatewayResponseId: 'ARKESEL-SMS-OK-77123',
      dispatchedAt: '18 mins ago',
      dispatchedBy: 'Compliance Directorate',
    },
    {
      id: 'LOG-SMS-903',
      dispatchId: 'DISP-SMS-8843',
      channel: 'SMS',
      category: 'Critical Shortage / Code Red',
      recipientId: 'EMP-007',
      recipientName: 'Akosua Serwaa',
      recipientPhone: '+233 27 555 4321',
      recipientDepartment: 'Maternity & NICU',
      recipientRole: 'Midwife Specialist',
      messageText: 'ROSTER BROADCAST: Night Shift handover briefing commences at 19:45 HRS prompt in Theatre Conference Room.',
      status: 'DELIVERED',
      gatewayResponseId: 'TWILIO-GSM-OK-44391',
      dispatchedAt: '1 hour ago',
      dispatchedBy: 'Hospital Operations',
    },
  ]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key
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

  // Copy helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Message text copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick SMS Dispatch
  const handleSendQuickSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRecipientPhone || !quickMessage.trim()) {
      showToast('Please enter recipient phone and message.', 'error');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const newEntry: DispatchLogEntry = {
        id: `LOG-SMS-${Date.now().toString().slice(-4)}`,
        dispatchId: `DISP-SMS-${Math.floor(1000 + Math.random() * 9000)}`,
        channel: isWhatsAppEnabled ? 'Dual (WhatsApp + SMS)' : 'SMS',
        category: 'Custom Notice',
        recipientId: quickStaffSelect || 'CUSTOM',
        recipientName: quickRecipientName || 'Hospital Staff',
        recipientPhone: quickRecipientPhone,
        recipientDepartment: currentUserDepartment || 'General',
        recipientRole: 'Healthcare Staff',
        messageText: quickMessage.trim(),
        status: 'DELIVERED',
        gatewayResponseId: `HUBTEL-SMS-OK-${Math.floor(10000 + Math.random() * 90000)}`,
        dispatchedAt: 'Just now',
        dispatchedBy: currentUser?.name || 'Dispatcher',
      };

      setLogs((prev) => [newEntry, ...prev]);
      setIsSending(false);
      setQuickMessage('');
      setQuickRecipientPhone('');
      setQuickRecipientName('');
      setQuickStaffSelect('');
      setActiveTab('outbox');
      showToast('SMS dispatched successfully to carrier gateway!', 'success');
    }, 450);
  };

  // Quick Call-In Dispatch
  const handleSendCallIn = () => {
    if (selectedStaffIds.length === 0) {
      showToast('Please select at least one staff member to call in.', 'error');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const newEntries: DispatchLogEntry[] = selectedStaffIds.map((id) => {
        const staff = employees.find((e) => e.id === id);
        const name = staff ? `${staff.firstName} ${staff.lastName}` : 'Staff Member';
        const phone = staff?.contactNumber || '+233 24 000 0000';
        return {
          id: `LOG-CALLIN-${Math.random().toString().slice(-4)}`,
          dispatchId: `DISP-EMERG-${Math.floor(1000 + Math.random() * 9000)}`,
          channel: isWhatsAppEnabled ? 'Dual (WhatsApp + SMS)' : 'SMS',
          category: 'Emergency Call-In',
          recipientId: id,
          recipientName: name,
          recipientPhone: phone,
          recipientDepartment: staff?.department || callInWard,
          recipientRole: staff?.designation || 'Clinical Staff',
          messageText: `PJPIIMC EMERGENCY CALL-IN: Urgent surge cover required in ${callInWard} (${callInUrgency}). Compensation: ${callInCompensation}. Reply or report to unit in-charge.`,
          status: 'DELIVERED',
          gatewayResponseId: `GSM-CARRIER-${Math.floor(10000 + Math.random() * 90000)}`,
          dispatchedAt: 'Just now',
          dispatchedBy: currentUser?.name || 'HR Operations',
        };
      });

      setLogs((prev) => [...newEntries, ...prev]);
      setIsSending(false);
      setSelectedStaffIds([]);
      setActiveTab('outbox');
      showToast(`Emergency SMS call-in sent to ${newEntries.length} staff members!`, 'success');
    }, 500);
  };

  // Quick Query Alert Dispatch
  const handleSendQueryAlert = () => {
    if (!selectedQueryId) {
      showToast('Please select an active query to dispatch.', 'error');
      return;
    }

    const query = staffQueries.find((q) => q.id === selectedQueryId);
    if (!query) return;

    setIsSending(true);
    setTimeout(() => {
      const newEntry: DispatchLogEntry = {
        id: `LOG-QRY-${Date.now().toString().slice(-4)}`,
        dispatchId: `DISP-QRY-${Math.floor(1000 + Math.random() * 9000)}`,
        channel: isWhatsAppEnabled ? 'Dual (WhatsApp + SMS)' : 'SMS',
        category: 'Disciplinary Query Alert',
        recipientId: query.employeeId,
        recipientName: query.employeeName,
        recipientPhone: '+233 24 400 1122',
        recipientDepartment: query.department,
        recipientRole: 'Hospital Staff',
        messageText: `PJPIIMC FORMAL NOTICE: Disciplinary Query (${query.id}) regarding "${query.title}" requires your written response by ${query.deadline}. Log in to Staff Portal to review.`,
        status: 'DELIVERED',
        gatewayResponseId: `GSM-QRY-OK-${Math.floor(10000 + Math.random() * 90000)}`,
        dispatchedAt: 'Just now',
        dispatchedBy: currentUser?.name || 'HR Compliance',
      };

      setLogs((prev) => [newEntry, ...prev]);
      setIsSending(false);
      setSelectedQueryId('');
      setActiveTab('outbox');
      showToast(`Query alert SMS delivered to ${query.employeeName}`, 'success');
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-[460px] md:w-[500px] rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
    >
      {/* Top Header - Matches Notification Dropdown */}
      <div className="mb-2.5 flex items-center justify-between border-b pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                SMS Notifications Gateway
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
              {isWhatsAppEnabled ? 'GSM SMS & WhatsApp Dual' : 'Direct GSM Carrier (100% Reliable)'} • {logs.length} Sent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onOpenFullModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullModal();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Expand to Full Pop-up Window"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl mb-3 text-[11px] font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('outbox')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
            activeTab === 'outbox'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="h-3 w-3" />
          <span>Outbox ({logs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('callin')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
            activeTab === 'callin'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flame className="h-3 w-3 text-rose-500" />
          <span>Call-In</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('query')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
            activeTab === 'query'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          <span>Query Alert</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quick_sms')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
            activeTab === 'quick_sms'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Send className="h-3 w-3" />
          <span>Quick SMS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Radio className="h-3 w-3" />
          <span>Carrier</span>
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="max-h-[320px] sm:max-h-[360px] overflow-y-auto pr-0.5 space-y-2 text-xs">
        {/* ==================================================== */}
        {/* TAB 1: OUTBOX LOGS (STYLED EXACTLY LIKE NOTIFICATIONS) */}
        {/* ==================================================== */}
        {activeTab === 'outbox' && (
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No SMS messages dispatched yet.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl p-2.5 text-xs transition bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">{log.recipientName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                        {log.recipientPhone}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{log.dispatchedAt}</span>
                  </div>

                  <p className="mt-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                    {log.messageText}
                  </p>

                  <div className="mt-2 flex items-center justify-between flex-wrap gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 font-mono font-bold">
                        {log.channel}
                      </span>
                      <span className="rounded bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-1.5 py-0.5">
                        {log.category}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <Check className="h-2.5 w-2.5" />
                        {log.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(log.id, log.messageText)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition text-[10px]"
                        title="Copy message text"
                      >
                        {copiedId === log.id ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                        <span>{copiedId === log.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <a
                        href={`sms:${log.recipientPhone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(log.messageText)}`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition text-[10px] font-bold"
                        title="Open in native SMS app"
                      >
                        <Smartphone className="h-2.5 w-2.5" />
                        <span>SMS</span>
                      </a>

                      <a
                        href={`tel:${log.recipientPhone.replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition text-[10px]"
                        title="Call Phone"
                      >
                        <Phone className="h-2.5 w-2.5" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: EMERGENCY CALL-IN FAST DISPATCH */}
        {/* ==================================================== */}
        {activeTab === 'callin' && (
          <div className="space-y-2.5 p-1">
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2">
              <Flame className="h-4 w-4 shrink-0 text-rose-500" />
              <span>Select department and off-duty personnel for instant emergency surge SMS alert.</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Target Unit / Ward
              </label>
              <select
                value={callInWard}
                onChange={(e) => setCallInWard(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Emergency Room (ER)">Emergency Room (ER)</option>
                <option value="Maternity & NICU">Maternity & NICU</option>
                <option value="Surgical Theatre">Surgical Theatre</option>
                <option value="Pediatrics Ward">Pediatrics Ward</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Urgency Level & Hazard Allowance
              </label>
              <select
                value={callInUrgency}
                onChange={(e) => setCallInUrgency(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Code Red - Immediate (30 min)">Code Red - Immediate (30 min response)</option>
                <option value="High Priority (1-2 Hours)">High Priority (1-2 Hours relief)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Select Staff to Call In ({selectedStaffIds.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedStaffIds.length === employees.slice(0, 5).length) {
                      setSelectedStaffIds([]);
                    } else {
                      setSelectedStaffIds(employees.slice(0, 5).map((e) => e.id));
                    }
                  }}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  {selectedStaffIds.length > 0 ? 'Deselect All' : 'Select Top 5'}
                </button>
              </div>

              <div className="max-h-28 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 space-y-1 bg-slate-50 dark:bg-slate-800/40">
                {employees.slice(0, 8).map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={selectedStaffIds.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStaffIds([...selectedStaffIds, emp.id]);
                          } else {
                            setSelectedStaffIds(selectedStaffIds.filter((id) => id !== emp.id));
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {emp.contactNumber || '0244000000'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendCallIn}
              disabled={isSending || selectedStaffIds.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black transition text-xs shadow-md disabled:opacity-50"
            >
              {isSending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Dispatch Call-In SMS ({selectedStaffIds.length})</span>
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: QUERY ALERT FAST DISPATCH */}
        {/* ==================================================== */}
        {activeTab === 'query' && (
          <div className="space-y-2.5 p-1">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>Select an issued staff query to notify the employee immediately via SMS alert.</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Select Active Disciplinary Query
              </label>
              <select
                value={selectedQueryId}
                onChange={(e) => setSelectedQueryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Choose Query to Dispatch --</option>
                {staffQueries.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.id}: {q.employeeName} - {q.title} ({q.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedQueryId && (
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-xs space-y-1">
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Notice to:</span>{' '}
                  {staffQueries.find((q) => q.id === selectedQueryId)?.employeeName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Deadline:{' '}
                  {staffQueries.find((q) => q.id === selectedQueryId)?.deadline || '48 Hours'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendQueryAlert}
              disabled={isSending || !selectedQueryId}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black transition text-xs shadow-md disabled:opacity-50"
            >
              {isSending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Send Query SMS Notice</span>
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: QUICK SMS DISPATCH */}
        {/* ==================================================== */}
        {activeTab === 'quick_sms' && (
          <form onSubmit={handleSendQuickSms} className="space-y-2.5 p-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Staff Quick Select or Enter Phone
              </label>
              <select
                value={quickStaffSelect}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickStaffSelect(val);
                  if (val) {
                    const emp = employees.find((emp) => emp.id === val);
                    if (emp) {
                      setQuickRecipientName(`${emp.firstName} ${emp.lastName}`);
                      setQuickRecipientPhone(emp.contactNumber || '+233 24 123 4567');
                    }
                  }
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5 focus:outline-none"
              >
                <option value="">-- Or Select Existing Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.department})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={quickRecipientName}
                  onChange={(e) => setQuickRecipientName(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone Number (+233...)"
                  value={quickRecipientPhone}
                  onChange={(e) => setQuickRecipientPhone(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Message Content
              </label>
              <textarea
                rows={3}
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder="Enter SMS message text..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition text-xs shadow-md disabled:opacity-50"
            >
              {isSending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Send SMS Message</span>
            </button>
          </form>
        )}

        {/* ==================================================== */}
        {/* TAB 5: CARRIER SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-2.5 p-1 text-xs">
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Active GSM Gateway:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Hubtel Ghana (Direct)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Sender ID:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">PJPIIMC-HR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Delivery Success:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">99.8% (Carrier Verified)</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Enable WhatsApp Channel</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isWhatsAppEnabled
                    ? 'WhatsApp Cloud API active alongside SMS'
                    : 'Disabled. 100% reliable GSM Cellular SMS active'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleWhatsApp(!isWhatsAppEnabled)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  isWhatsAppEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isWhatsAppEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 text-[10px]">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px]">ESC</kbd> to close
        </span>

        {onOpenFullModal && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullModal();
            }}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>Open Full Window</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};
