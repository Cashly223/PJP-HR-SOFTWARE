import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  X,
  UserPlus,
  PlaneTakeoff,
  Scale,
  Clock,
  AlertTriangle,
  Sparkles,
  Zap,
  CheckCircle2,
  Building2,
  Calendar,
  DollarSign,
  Shield,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Briefcase,
  Layers,
  ArrowRight,
  Compass,
  Check,
  Send,
  Fingerprint,
  FileText,
  AlertCircle,
  HelpCircle,
  Camera,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { MobileGeofenceFacialClockIn } from '../attendance/MobileGeofenceFacialClockIn';
import {
  Employee,
  LeaveRequest,
  Grievance,
  UserRole,
  AttendanceRecord,
} from '../../types/hrms';
import { calculateLeaveDays, calculateResumptionDate } from '../../lib/leaveUtils';

type QuickModalType =
  | null
  | 'request_leave'
  | 'raise_grievance'
  | 'clock_in'
  | 'report_incident';

export const QuickActionsFAB: React.FC = () => {
  const {
    employees,
    currentUser,
    activeRole,
    addLeaveRequest,
    addGrievance,
    addClockIn,
    addIncident,
    setActiveTab,
    selectedHospital,
    currency,
    formatCurrency,
  } = useHrms();

  // Speed Dial open/close state
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<QuickModalType>(null);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Keyboard shortcut listener (Alt+Q to toggle FAB, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'q') || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeModal]);

  const triggerToast = (title: string, description: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, description, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const openActionModal = (modal: QuickModalType) => {
    setIsOpen(false);
    setActiveModal(modal);
  };

  /* -------------------------------------------------------------
   * FORM STATE 1: REQUEST LEAVE
   * ------------------------------------------------------------- */
  const defaultApplicantEmp = useMemo(() => {
    if (currentUser?.id) {
      const match = employees.find((e) => e.id === currentUser.id);
      if (match) return match;
    }
    return employees[0] || null;
  }, [currentUser, employees]);

  const [leaveEmployeeId, setLeaveEmployeeId] = useState<string>(
    defaultApplicantEmp?.id || ''
  );
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Annual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [leaveEndDate, setLeaveEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [leaveReason, setLeaveReason] = useState<string>(
    'Annual scheduled rest, family vacation, and mental rejuvenation.'
  );
  const [leaveRelievingOfficer, setLeaveRelievingOfficer] = useState<string>('Sister Linda Asare');
  const [leaveEmergencyPhone, setLeaveEmergencyPhone] = useState<string>('+233 20 555 0192');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Sync leave applicant when modal opens
  useEffect(() => {
    if (defaultApplicantEmp && !leaveEmployeeId) {
      setLeaveEmployeeId(defaultApplicantEmp.id);
    }
  }, [defaultApplicantEmp, leaveEmployeeId]);

  const selectedLeaveEmp = useMemo(() => {
    return employees.find((e) => e.id === leaveEmployeeId) || defaultApplicantEmp;
  }, [employees, leaveEmployeeId, defaultApplicantEmp]);

  const computedLeaveDays = useMemo(() => {
    if (!leaveStartDate || !leaveEndDate) return 0;
    return calculateLeaveDays(leaveStartDate, leaveEndDate, leaveType);
  }, [leaveStartDate, leaveEndDate, leaveType]);

  const handleRequestLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveEmp) {
      triggerToast('Error', 'Please select an employee.', 'error');
      return;
    }

    setIsSubmittingLeave(true);
    try {
      const newLeaveReq: Partial<LeaveRequest> = {
        employeeId: selectedLeaveEmp.id,
        employeeName: `${selectedLeaveEmp.firstName} ${selectedLeaveEmp.lastName}`,
        staffId: selectedLeaveEmp.empCode || 'STF-1001',
        grade: selectedLeaveEmp.jobTitle || selectedLeaveEmp.grade || 'Staff Officer',
        department: selectedLeaveEmp.department || 'Clinical Services',
        unit: selectedLeaveEmp.unit || 'General Unit',
        leaveType,
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        dateOfResumption: calculateResumptionDate(leaveEndDate),
        totalDays: computedLeaveDays || 1,
        reason: `${leaveReason} (Handover to: ${leaveRelievingOfficer})`,
        phoneOnLeave: leaveEmergencyPhone || selectedLeaveEmp.phone || '+233 20 000 0000',
        leaveYear: new Date().getFullYear(),
        leaveEntitlement: selectedLeaveEmp.leaveEntitlement ?? 30,
        deferredLeaveDaysDue: selectedLeaveEmp.deferredLeaveDays ?? 0,
      };

      addLeaveRequest(newLeaveReq);

      triggerToast(
        'Leave Application Submitted!',
        `Filed ${computedLeaveDays} day(s) ${leaveType} for ${selectedLeaveEmp.firstName} ${selectedLeaveEmp.lastName}. Routed to Unit & Dept Head.`,
        'success'
      );

      setActiveModal(null);
    } catch (err: any) {
      triggerToast('Submission Failed', err.message || 'Error submitting leave request.', 'error');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  /* -------------------------------------------------------------
   * FORM STATE 3: RAISE GRIEVANCE
   * ------------------------------------------------------------- */
  const [grvIsAnonymous, setGrvIsAnonymous] = useState<boolean>(true);
  const [grvSubmittedBy, setGrvSubmittedBy] = useState<string>(
    currentUser?.name || 'Staff Member'
  );
  const [grvCategory, setGrvCategory] = useState<Grievance['category']>(
    'Shift / Scheduling Unfairness'
  );
  const [grvSeverity, setGrvSeverity] = useState<Grievance['severity']>('Medium');
  const [grvDepartment, setGrvDepartment] = useState<string>('Emergency Ward & ICU');
  const [grvSubject, setGrvSubject] = useState<string>('');
  const [grvDescription, setGrvDescription] = useState<string>('');
  const [isSubmittingGrv, setIsSubmittingGrv] = useState(false);

  const handleRaiseGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grvSubject.trim() || !grvDescription.trim()) {
      triggerToast('Incomplete Form', 'Please enter a grievance subject and description.', 'error');
      return;
    }

    setIsSubmittingGrv(true);
    try {
      addGrievance({
        isAnonymous: grvIsAnonymous,
        submittedBy: grvIsAnonymous ? 'Anonymous Employee' : grvSubmittedBy.trim() || 'Staff Member',
        submittedById: grvIsAnonymous ? undefined : currentUser?.id,
        category: grvCategory,
        severity: grvSeverity,
        department: grvDepartment,
        subject: grvSubject.trim(),
        description: grvDescription.trim(),
      });

      triggerToast(
        'Grievance Ticket Created',
        `Your grievance has been securely logged with HR & Ethics Committee with ${grvIsAnonymous ? 'Full Anonymity Protected' : 'Attributed Confidentiality'}.`,
        'success'
      );

      setGrvSubject('');
      setGrvDescription('');
      setActiveModal(null);
    } catch (err: any) {
      triggerToast('Error Submitting Ticket', err.message || 'Failed to submit grievance.', 'error');
    } finally {
      setIsSubmittingGrv(false);
    }
  };

  /* -------------------------------------------------------------
   * FORM STATE 4: QUICK BIOMETRIC CLOCK-IN & OPTION B GEOFENCE FACE
   * ------------------------------------------------------------- */
  const [clockModalTab, setClockModalTab] = useState<'geofence_face' | 'quick_sensor'>('geofence_face');
  const [clockMethod, setClockMethod] = useState<AttendanceRecord['method']>('Biometric_Fingerprint');
  const [isClocking, setIsClocking] = useState(false);
  const [clockSuccess, setClockSuccess] = useState(false);

  const handleClockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = defaultApplicantEmp || employees[0];
    if (!emp) return;

    const deptTerminal = `${emp.department || 'Intensive Care Unit (ICU)'} Biometric Terminal`;

    setIsClocking(true);
    setTimeout(() => {
      addClockIn(emp.id, clockMethod, deptTerminal);
      setIsClocking(false);
      setClockSuccess(true);
      triggerToast(
        'Attendance Clock-In Logged!',
        `Recorded ${emp.firstName} ${emp.lastName} (${clockMethod.replace('_', ' ')}) at ${deptTerminal} • Status: On-Time.`,
        'success'
      );
      setTimeout(() => {
        setClockSuccess(false);
        setActiveModal(null);
      }, 1500);
    }, 1000);
  };

  /* -------------------------------------------------------------
   * FORM STATE 5: REPORT SAFETY INCIDENT
   * ------------------------------------------------------------- */
  const [incType, setIncType] = useState<
    'Needle Stick Injury' | 'Chemical / Radiation Exposure' | 'Patient Handling Injury' | 'Safety Violation' | 'Equipment Malfunction'
  >('Needle Stick Injury');
  const [incSeverity, setIncSeverity] = useState<'Low' | 'Medium' | 'Critical'>('Medium');
  const [incDesc, setIncDesc] = useState('');
  const [isSubmittingInc, setIsSubmittingInc] = useState(false);

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incDesc.trim()) {
      triggerToast('Description Required', 'Please provide details of the incident.', 'error');
      return;
    }

    setIsSubmittingInc(true);
    try {
      const emp = defaultApplicantEmp || employees[0];
      addIncident({
        employeeId: emp?.id || 'emp-101',
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Staff Member',
        type: incType,
        severity: incSeverity,
        description: incDesc.trim(),
      });

      triggerToast(
        'Incident Logged with Health & Safety',
        `Incident report (${incType}) escalated to Occupational Health & Infection Control.`,
        'success'
      );

      setIncDesc('');
      setActiveModal(null);
    } catch (err: any) {
      triggerToast('Incident Log Failed', err.message || 'Error logging incident.', 'error');
    } finally {
      setIsSubmittingInc(false);
    }
  };

  return (
    <>
      {/* =========================================================
          GLOBAL FLOATING ACTION BUTTON (FAB) CONTAINER
          ========================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none select-none font-sans">
        {/* TOAST CONFIRMATION NOTIFICATION */}
        {toastMessage && (
          <div className="pointer-events-auto mb-3 flex items-start gap-3 rounded-2xl bg-slate-900/95 border border-indigo-500/40 p-4 shadow-2xl backdrop-blur-md text-white max-w-sm animate-in slide-in-from-bottom-3 duration-200">
            {toastMessage.type === 'success' && (
              <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            {toastMessage.type === 'error' && (
              <div className="h-8 w-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertCircle className="h-5 w-5" />
              </div>
            )}
            {toastMessage.type === 'info' && (
              <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1">
              <h5 className="text-xs font-black text-white">{toastMessage.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toastMessage.description}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* SPEED DIAL EXPANDABLE ACTION ITEMS */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pointer-events-auto mb-3 flex flex-col items-end gap-2.5"
            >
              {/* Action 1: Request Leave */}
              <motion.div
                whileHover={{ x: -4, transition: { duration: 0.12 } }}
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => openActionModal('request_leave')}
              >
                <span className="rounded-xl bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-slate-100 shadow-xl border border-slate-700/80 backdrop-blur-md transition group-hover:bg-slate-800 group-hover:border-emerald-500/50 group-hover:text-white">
                  Request Leave
                </span>
                <motion.button
                  type="button"
                  id="fab-request-leave-btn"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionModal('request_leave');
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30 transition border border-emerald-400/40"
                  title="Submit Official Leave Application"
                >
                  <PlaneTakeoff className="h-5 w-5" />
                </motion.button>
              </motion.div>

              {/* Action 3: Raise Grievance */}
              <motion.div
                whileHover={{ x: -4, transition: { duration: 0.12 } }}
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => openActionModal('raise_grievance')}
              >
                <span className="rounded-xl bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-slate-100 shadow-xl border border-slate-700/80 backdrop-blur-md transition group-hover:bg-slate-800 group-hover:border-rose-500/50 group-hover:text-white">
                  Raise Grievance
                </span>
                <motion.button
                  type="button"
                  id="fab-raise-grievance-btn"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionModal('raise_grievance');
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-xl shadow-rose-600/30 transition border border-rose-400/40"
                  title="Confidential Workplace Resolution Ticket"
                >
                  <Scale className="h-5 w-5" />
                </motion.button>
              </motion.div>

              {/* Action 4: Biometric Attendance Clock-In */}
              <motion.div
                whileHover={{ x: -4, transition: { duration: 0.12 } }}
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => openActionModal('clock_in')}
              >
                <span className="rounded-xl bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-slate-100 shadow-xl border border-slate-700/80 backdrop-blur-md transition group-hover:bg-slate-800 group-hover:border-amber-500/50 group-hover:text-white">
                  Quick Clock-In
                </span>
                <motion.button
                  type="button"
                  id="fab-clock-in-btn"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionModal('clock_in');
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xl shadow-amber-600/30 transition border border-amber-400/40"
                  title="Record Instant Biometric Duty Attendance"
                >
                  <Fingerprint className="h-5 w-5" />
                </motion.button>
              </motion.div>

              {/* Action 5: Report Safety Incident */}
              <motion.div
                whileHover={{ x: -4, transition: { duration: 0.12 } }}
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => openActionModal('report_incident')}
              >
                <span className="rounded-xl bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-slate-100 shadow-xl border border-slate-700/80 backdrop-blur-md transition group-hover:bg-slate-800 group-hover:border-orange-500/50 group-hover:text-white">
                  Report Safety Incident
                </span>
                <motion.button
                  type="button"
                  id="fab-report-incident-btn"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionModal('report_incident');
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-red-500 text-white shadow-xl shadow-orange-600/30 transition border border-orange-400/40"
                  title="Log Clinical Hazard or Needle-Stick Injury"
                >
                  <AlertTriangle className="h-5 w-5" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRIMARY FLOATING TRIGGER BUTTON */}
        <div className="pointer-events-auto flex items-center gap-2">
          {!isOpen && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-bold text-indigo-300 border border-slate-700/80 shadow-lg backdrop-blur-md"
            >
              <Sparkles className="h-3 w-3 text-indigo-400" /> Quick Actions <span className="text-slate-500 font-mono text-[10px]">Alt+Q</span>
            </motion.span>
          )}

          <motion.button
            type="button"
            id="global-quick-actions-fab"
            onClick={() => setIsOpen((prev) => !prev)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-colors duration-200 ${
              isOpen
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-4 ring-rose-500/20'
                : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/40 ring-4 ring-indigo-500/20'
            }`}
            title={isOpen ? 'Close Quick Actions' : 'Open Quick Actions (Alt+Q)'}
          >
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* =========================================================
          MODAL 1: REQUEST LEAVE APPLICATION
          ========================================================= */}
      {activeModal === 'request_leave' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg">
                  <PlaneTakeoff className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Quick Action: Request Staff Leave
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Sequential Multi-Tier Workflow
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Apply for authorized absence and trigger Unit & Department Head approval.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRequestLeaveSubmit} className="space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Applicant Staff Member
                </label>
                <select
                  value={leaveEmployeeId}
                  onChange={(e) => setLeaveEmployeeId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.empCode}) • {e.department} - {e.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type & Entitlement Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Leave Category
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick / Medical">Sick / Medical Leave</option>
                    <option value="Maternity">Maternity Leave (14 Wks Calendar)</option>
                    <option value="Paternity">Paternity Leave (10 Days)</option>
                    <option value="Study / CME">Study / CME Fellowship Leave</option>
                    <option value="Hazard / Emergency">Hazard / Emergency Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-300 uppercase font-bold block">Annual Entitlement</span>
                    <span className="text-base font-mono font-black text-white">
                      {selectedLeaveEmp?.leaveEntitlement ?? 30} Days
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-300 uppercase font-bold block">Deferred / Carried</span>
                    <span className="text-base font-mono font-black text-white">
                      +{selectedLeaveEmp?.deferredLeaveDays ?? 0} Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Date Range & Computed Working Days */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Working Days</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {computedLeaveDays} {computedLeaveDays === 1 ? 'Day' : 'Days'}
                  </span>
                  {leaveEndDate && (
                    <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
                      Resumes: {calculateResumptionDate(leaveEndDate)} (+1d)
                    </span>
                  )}
                </div>
              </div>

              {/* Relieving Officer & Emergency Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Relieving Officer / Handover Staff
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sister Linda Asare"
                    value={leaveRelievingOfficer}
                    onChange={(e) => setLeaveRelievingOfficer(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Emergency Contact on Leave
                  </label>
                  <input
                    type="text"
                    value={leaveEmergencyPhone}
                    onChange={(e) => setLeaveEmergencyPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Justification / Reason */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Reason for Leave / Handover Notes
                </label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <PlaneTakeoff className="h-4 w-4" />
                  {isSubmittingLeave ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: RAISE GRIEVANCE (CONFIDENTIAL / ANONYMOUS)
          ========================================================= */}
      {activeModal === 'raise_grievance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-rose-500/30 p-6 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-lg">
                  <Scale className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Quick Action: Raise Workplace Grievance
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Confidential & Safe Space
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    File a confidential complaint or unfairness report directly to HR & Ethics Mediation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseGrievanceSubmit} className="space-y-4">
              {/* Anonymous vs Attributed Toggle */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-5 w-5 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-rose-200 block">
                      Anonymous Submission Mode
                    </span>
                    <span className="text-[11px] text-slate-400">
                      When enabled, your identity is completely hidden from the grievance ticket.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGrvIsAnonymous((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    grvIsAnonymous
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {grvIsAnonymous ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {grvIsAnonymous ? 'Anonymous: YES' : 'Anonymous: NO'}
                </button>
              </div>

              {!grvIsAnonymous && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Your Name / Identifier
                  </label>
                  <input
                    type="text"
                    value={grvSubmittedBy}
                    onChange={(e) => setGrvSubmittedBy(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white font-medium focus:border-rose-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Category, Severity & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Infraction Category
                  </label>
                  <select
                    value={grvCategory}
                    onChange={(e) => setGrvCategory(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white font-bold focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Shift / Scheduling Unfairness">Shift / Scheduling Unfairness</option>
                    <option value="Workplace Harassment">Workplace Harassment</option>
                    <option value="Pay & Allowance Discrepancy">Pay & Overtime Discrepancy</option>
                    <option value="Clinical Safety / Patient Risk">Clinical Safety / Patient Risk</option>
                    <option value="Management / Interpersonal">Management / Interpersonal</option>
                    <option value="Discrimination">Discrimination / Bias</option>
                    <option value="Other">Other Policy Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={grvSeverity}
                    onChange={(e) => setGrvSeverity(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white font-bold focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Low">Low - Minor Concern</option>
                    <option value="Medium">Medium - Standard Dispute</option>
                    <option value="High">High - Significant Impact</option>
                    <option value="Critical">Critical - Urgent Safety / Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Department / Ward
                  </label>
                  <input
                    type="text"
                    value={grvDepartment}
                    onChange={(e) => setGrvDepartment(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white font-medium focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unfair distribution of night ICU duties and unapproved shift cancellation"
                  value={grvSubject}
                  onChange={(e) => setGrvSubject(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white font-medium focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Detailed Narrative */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Detailed Statement of Events *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise details, dates, individuals involved, and desired resolution..."
                  value={grvDescription}
                  onChange={(e) => setGrvDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrv}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/30"
                >
                  <Send className="h-4 w-4" />
                  {isSubmittingGrv ? 'Filing...' : 'Submit Grievance Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: QUICK BIOMETRIC CLOCK-IN & OPTION B GEOFENCE FACE
          ========================================================= */}
      {activeModal === 'clock_in' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Staff Attendance Clock-In</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Option B Recommended
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-slate-400">Department:</span>
                    <span className="text-[11px] font-bold text-slate-200">
                      {defaultApplicantEmp?.department || 'Department Duty Station'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setClockModalTab('geofence_face')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  clockModalTab === 'geofence_face'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Option B: Mobile Geofence & Face Clock-In</span>
              </button>

              <button
                type="button"
                onClick={() => setClockModalTab('quick_sensor')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  clockModalTab === 'quick_sensor'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Fingerprint className="h-3.5 w-3.5" />
                <span>Station Sensor Simulator</span>
              </button>
            </div>

            {clockModalTab === 'geofence_face' ? (
              <MobileGeofenceFacialClockIn
                embeddedMode={true}
                onSuccess={() => {
                  triggerToast(
                    'Facial Attendance Verified & Synced!',
                    `Logged attendance for ${defaultApplicantEmp?.firstName || 'Staff'} via Option B GPS radar & facial biometric selfie.`,
                    'success'
                  );
                  setTimeout(() => setActiveModal(null), 2200);
                }}
              />
            ) : (
              <div className="space-y-4 max-w-md mx-auto py-2">
                <div className="text-center py-4 space-y-3">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
                    <button
                      type="button"
                      onClick={handleClockInSubmit}
                      disabled={isClocking || clockSuccess}
                      className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all ${
                        clockSuccess
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : isClocking
                          ? 'bg-amber-600 border-amber-400 text-white animate-spin'
                          : 'bg-amber-500/20 border-amber-400 text-amber-300 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {clockSuccess ? (
                        <CheckCircle2 className="h-10 w-10" />
                      ) : (
                        <Fingerprint className="h-10 w-10" />
                      )}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {clockSuccess
                        ? 'Verified & Clocked In!'
                        : isClocking
                        ? 'Authenticating Biometrics...'
                        : 'Tap Fingerprint Sensor to Log Attendance'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date().toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400">
                    Verification Channel
                  </label>
                  <select
                    value={clockMethod}
                    onChange={(e) => setClockMethod(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="Biometric_Fingerprint">Biometric Optical Fingerprint</option>
                    <option value="Facial_Recognition">AI Facial Recognition</option>
                    <option value="RFID_Badge">NFC / RFID Hospital Smart Badge</option>
                    <option value="QR_Mobile">Mobile QR Terminal Scan</option>
                    <option value="GPS_Geofence">GPS Verified Hospital Geofence</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleClockInSubmit}
                    disabled={isClocking || clockSuccess}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition shadow"
                  >
                    {isClocking ? 'Verifying...' : 'Clock In Now'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: REPORT SAFETY INCIDENT
          ========================================================= */}
      {activeModal === 'report_incident' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-orange-500/30 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Report Health & Safety Incident</h3>
                  <p className="text-xs text-slate-400">Clinical Hazard & Occupational Health Log</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIncidentSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Incident Classification
                </label>
                <select
                  value={incType}
                  onChange={(e) => setIncType(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="Needle Stick Injury">Needle Stick Injury / Sharp Exposure</option>
                  <option value="Chemical / Radiation Exposure">Chemical / Radiation Exposure</option>
                  <option value="Patient Handling Injury">Patient Handling / Ergonomic Strain</option>
                  <option value="Safety Violation">Safety Protocol Violation</option>
                  <option value="Equipment Malfunction">Critical Equipment Malfunction</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Urgency / Severity Level
                </label>
                <select
                  value={incSeverity}
                  onChange={(e) => setIncSeverity(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="Low">Low - Contained / No immediate harm</option>
                  <option value="Medium">Medium - Requires clinical observation</option>
                  <option value="Critical">Critical - Immediate PEP / Emergency attention</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Incident Description & Location *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify location, ward, exact time, and circumstances of incident..."
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInc}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black transition shadow"
                >
                  {isSubmittingInc ? 'Logging...' : 'Submit Incident Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
