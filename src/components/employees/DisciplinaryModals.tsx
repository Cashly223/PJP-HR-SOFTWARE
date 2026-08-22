import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  AlertOctagon,
  Users,
  Calendar,
  Clock,
  MapPin,
  Award,
  Gavel,
  CheckCircle2,
  Paperclip,
  Printer,
  Download,
  ShieldCheck,
  Building2,
  Edit3,
  Save,
  RotateCcw,
  Eye,
  ShieldAlert,
  AlertCircle,
  Sparkles,
  UserCheck,
  Check,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import {
  StaffQuery,
  DisciplinaryHearing,
  DisciplinaryBoardMember,
  BoardRole,
  MisconductCategory,
  DisciplinarySanction,
} from '../../types/hrms';
import { PjpiimcLogo } from '../common/PjpiimcLogo';
import { printElementById, downloadPrintableHtml } from '../../utils/printDocument';

// ----------------------------------------------------
// 1. ISSUE STAFF QUERY MODAL
// ----------------------------------------------------
interface IssueStaffQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type QueryAuthorityTier = 'unit_head' | 'dept_head' | 'hr' | 'facility_head';

export const IssueStaffQueryModal: React.FC<IssueStaffQueryModalProps> = ({ isOpen, onClose }) => {
  const { employees, currentUser, activeRole, issueStaffQuery } = useHrms();

  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [authorityTier, setAuthorityTier] = useState<QueryAuthorityTier>(() => {
    if (activeRole === 'unit_head') return 'unit_head';
    if (activeRole === 'dept_head') return 'dept_head';
    if (activeRole === 'facility_head') return 'facility_head';
    return 'hr';
  });

  const [issuedByName, setIssuedByName] = useState<string>(currentUser?.name || 'Miss Veronica Ansah');
  const [issuedByRole, setIssuedByRole] = useState<string>(() => {
    if (activeRole === 'unit_head') return 'Unit Head / Ward In-Charge';
    if (activeRole === 'dept_head') return 'Head of Department (HOD)';
    if (activeRole === 'facility_head') return 'Medical Director / Head of Facility';
    return 'Director of Human Resources & Legal Affairs';
  });
  const [throughRouting, setThroughRouting] = useState<string>('Head of Department / Unit Head');

  const [misconductCategory, setMisconductCategory] = useState<MisconductCategory>('Absenteeism & Chronic Lateness');
  const [subject, setSubject] = useState<string>('');
  const [allegationDetails, setAllegationDetails] = useState<string>('');
  const [policyClauseViolated, setPolicyClauseViolated] = useState<string>('PJPIIMC Staff Handbook Section 14.2 & Code of Conduct');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [incidentLocation, setIncidentLocation] = useState<string>('');
  const [responseDeadlineHours, setResponseDeadlineHours] = useState<number>(48);
  const [severity, setSeverity] = useState<StaffQuery['severity']>('High');
  const [evidenceName, setEvidenceName] = useState<string>('');

  // Handle tier changes
  const handleAuthorityTierChange = (tier: QueryAuthorityTier) => {
    setAuthorityTier(tier);
    if (tier === 'unit_head') {
      setIssuedByRole('Unit Head / Ward In-Charge');
      setThroughRouting('Head of Department');
    } else if (tier === 'dept_head') {
      setIssuedByRole('Head of Department (HOD)');
      setThroughRouting('Directorate of HR & Legal Affairs');
    } else if (tier === 'facility_head') {
      setIssuedByRole('Medical Director / Head of Facility (CEO)');
      setThroughRouting('Direct Executive Command');
    } else {
      setIssuedByRole('Director of Human Resources & Legal Governance');
      setThroughRouting('Head of Department / Unit Head');
    }
  };

  if (!isOpen) return null;

  const targetEmp = employees.find((e) => e.id === selectedEmpId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmp) {
      alert('Please select an employee to query.');
      return;
    }
    if (!subject.trim() || !allegationDetails.trim()) {
      alert('Please enter a subject and clear allegation statement.');
      return;
    }

    const deadlineDate = new Date(Date.now() + responseDeadlineHours * 3600 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 16);

    const attachedEvidence = evidenceName.trim()
      ? [
          {
            id: `ev-${Date.now()}`,
            name: evidenceName.trim(),
            type: 'pdf',
            uploadedAt: new Date().toISOString().slice(0, 10),
            uploadedBy: issuedByName || currentUser?.name || 'HR Directorate',
          },
        ]
      : [];

    issueStaffQuery({
      staffId: targetEmp.id,
      staffName: targetEmp.name,
      staffEmpCode: targetEmp.employeeCode || 'PJPII-EMP',
      staffDepartment: targetEmp.department || 'General Medicine',
      staffRole: targetEmp.role || 'Staff Member',
      staffEmail: targetEmp.email,
      staffAvatar: targetEmp.avatar,
      issuedBy: issuedByName.trim() || currentUser?.name || 'Miss Veronica Ansah',
      issuedById: currentUser?.id || 'auth-officer',
      issuedByRole: issuedByRole.trim() || 'HR Directorate',
      incidentDate,
      incidentLocation: incidentLocation.trim() || `${targetEmp.department} Ward / Hospital Grounds`,
      misconductCategory,
      subject: subject.trim(),
      allegationDetails: allegationDetails.trim(),
      policyClauseViolated: policyClauseViolated.trim(),
      responseDeadlineHours,
      responseDeadlineDate: deadlineDate,
      severity,
      attachedEvidence,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Issue Official Disciplinary Query</h3>
              <p className="text-xs text-slate-400">Formal disciplinary inquiry memo under hospital governance code</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Statutory Authority Governance Callout */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] leading-tight">
              <p className="font-bold text-amber-200">Statutory Query Authorization Standard</p>
              <p className="text-amber-300/90">
                In compliance with the PJPIIMC Code of Governance and Ghana Labour Act 2003 (Act 651), only <strong>Unit Heads</strong>, <strong>Departmental Heads (HODs)</strong>, <strong>Human Resources Directorate</strong>, and the <strong>Head of Facility</strong> possess official mandate to query staff.
              </p>
            </div>
          </div>

          {/* Issuing Authority Tier Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Issuing Authority Tier *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleAuthorityTierChange('unit_head')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  authorityTier === 'unit_head'
                    ? 'bg-rose-600/20 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-xs text-rose-300">Unit Head</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Ward In-Charge</span>
              </button>

              <button
                type="button"
                onClick={() => handleAuthorityTierChange('dept_head')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  authorityTier === 'dept_head'
                    ? 'bg-rose-600/20 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-xs text-rose-300">Dept. Head</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">HOD / Division</span>
              </button>

              <button
                type="button"
                onClick={() => handleAuthorityTierChange('hr')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  authorityTier === 'hr'
                    ? 'bg-rose-600/20 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-xs text-rose-300">HR Directorate</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">HR & Legal Affairs</span>
              </button>

              <button
                type="button"
                onClick={() => handleAuthorityTierChange('facility_head')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  authorityTier === 'facility_head'
                    ? 'bg-rose-600/20 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-xs text-rose-300">Facility Head</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Medical Director / CEO</span>
              </button>
            </div>
          </div>

          {/* Issuing Officer Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Authorized Officer Name *</label>
              <input
                type="text"
                value={issuedByName}
                onChange={(e) => setIssuedByName(e.target.value)}
                placeholder="e.g. Dr. Kwame Mensah / Miss Veronica Ansah"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Designation / Title *</label>
              <input
                type="text"
                value={issuedByRole}
                onChange={(e) => setIssuedByRole(e.target.value)}
                placeholder="e.g. Head of Department, Internal Medicine"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Employee Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Employee to Query *</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">-- Select Employee to Query --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeCode || emp.id}) — {emp.department} [{emp.role}]
                </option>
              ))}
            </select>
          </div>

          {targetEmp && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-white font-bold">{targetEmp.name}</span>
                <span className="text-slate-400 block text-[11px]">{targetEmp.department} • {targetEmp.email}</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold text-xs">{targetEmp.employeeCode}</span>
            </div>
          )}

          {/* Misconduct Category & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Misconduct Category *</label>
              <select
                value={misconductCategory}
                onChange={(e) => setMisconductCategory(e.target.value as MisconductCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="Absenteeism & Chronic Lateness">Absenteeism & Chronic Lateness</option>
                <option value="Clinical Negligence / Protocol Breach">Clinical Negligence / Protocol Breach</option>
                <option value="Financial & Billing Irregularity">Financial & Billing Irregularity</option>
                <option value="Workplace Harassment / Unprofessional Conduct">Workplace Harassment / Unprofessional Conduct</option>
                <option value="Insubordination & Refusal of Lawful Duty">Insubordination & Refusal of Lawful Duty</option>
                <option value="Confidentiality & HIPAA / Data Breach">Confidentiality & HIPAA / Data Breach</option>
                <option value="Medication & Prescription Discrepancy">Medication & Prescription Discrepancy</option>
                <option value="Substance Abuse on Duty">Substance Abuse on Duty</option>
                <option value="Fraudulent Certification / Misrepresentation">Fraudulent Certification / Misrepresentation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Severity Rating *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as StaffQuery['severity'])}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="Minor">Minor Infraction</option>
                <option value="Medium">Medium Misconduct</option>
                <option value="High">High / Serious Breach</option>
                <option value="Critical / Gross Misconduct">Critical / Gross Misconduct</option>
              </select>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subject / Matter of Query *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Unexcused Absence from Critical Night Duty Shift on August 16, 2026"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Allegation Details */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Specific Statement of Allegations & Facts *</label>
            <textarea
              rows={4}
              value={allegationDetails}
              onChange={(e) => setAllegationDetails(e.target.value)}
              placeholder="State precise dates, times, affected patients/wards, witnesses, and specific conduct being queried..."
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Policy Clause & Response Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Policy Clause Violated</label>
              <input
                type="text"
                value={policyClauseViolated}
                onChange={(e) => setPolicyClauseViolated(e.target.value)}
                placeholder="e.g. PJPIIMC Staff Handbook Section 14.2 & Code of Conduct"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mandatory Response Window</label>
              <select
                value={responseDeadlineHours}
                onChange={(e) => setResponseDeadlineHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value={24}>24 Hours (Urgent / Immediate)</option>
                <option value={48}>48 Hours (Standard Hospital Protocol)</option>
                <option value={72}>72 Hours (Gross Misconduct / Complex)</option>
                <option value={120}>5 Business Days</option>
              </select>
            </div>
          </div>

          {/* Incident Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Incident Date</label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Incident Location / Ward</label>
              <input
                type="text"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                placeholder="e.g. Emergency Triage / Ward 4"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Evidence Attachment Log */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Attach Incident Log / Audit Report Filename</label>
            <input
              type="text"
              value={evidenceName}
              onChange={(e) => setEvidenceName(e.target.value)}
              placeholder="e.g. Shift_Attendance_Log_Aug16.pdf"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition"
            >
              Dispatch Official Query
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. ADD DISCIPLINARY BOARD MEMBER MODAL
// ----------------------------------------------------
interface AddBoardMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBoardMemberModal: React.FC<AddBoardMemberModalProps> = ({ isOpen, onClose }) => {
  const { employees, addDisciplinaryBoardMember } = useHrms();

  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [boardRole, setBoardRole] = useState<BoardRole>('Member');
  const [votingRights, setVotingRights] = useState<boolean>(true);
  const [tenureStartDate, setTenureStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [tenureEndDate, setTenureEndDate] = useState<string>('');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setCustomName(emp.name);
      setEmail(emp.email);
      setDepartment(emp.department || 'General Administration');
      setDesignation(emp.role || 'Staff');
      setPhone(emp.phone || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('Please provide member name.');
      return;
    }

    addDisciplinaryBoardMember({
      employeeId: selectedEmpId || `ext-${Date.now()}`,
      name: customName.trim(),
      email: email.trim(),
      department: department.trim(),
      designation: designation.trim(),
      boardRole,
      votingRights,
      tenureStartDate,
      tenureEndDate: tenureEndDate || undefined,
      status: 'Active',
      appointedBy: 'Hospital Board of Governors',
      appointmentNotes: appointmentNotes.trim(),
      phone: phone.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Appoint Disciplinary Board Member</h3>
              <p className="text-xs text-slate-400">Register statutory member to Standing Disciplinary Tribunal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Quick Select Employee */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Pick Existing Staff Member</label>
            <select
              value={selectedEmpId}
              onChange={(e) => handleSelectEmployee(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">-- Choose Staff or Enter Manually --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                placeholder="e.g. Rev. Fr. Mike"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="official.email@pjpiimc.org"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Board Role Portfolio *</label>
              <select
                value={boardRole}
                onChange={(e) => setBoardRole(e.target.value as BoardRole)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Chairman">Chairman (Presiding Executive)</option>
                <option value="Secretary">Secretary (HR Lead / Case Recorder)</option>
                <option value="Legal & Ethics Advisor">Legal & Ethics Advisor</option>
                <option value="Clinical Director Representative">Clinical Director Representative</option>
                <option value="Nursing Directorate Representative">Nursing Directorate Representative</option>
                <option value="Staff Representative">Staff Welfare Representative</option>
                <option value="HR Representative">HR Representative</option>
                <option value="Member">Standing Committee Member</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Legal & Compliance"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Designation / Title</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Head of Legal & Ethics"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 24 000 0000"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tenure Start Date</label>
              <input
                type="date"
                value={tenureStartDate}
                onChange={(e) => setTenureStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tenure End Date (Optional)</label>
              <input
                type="date"
                value={tenureEndDate}
                onChange={(e) => setTenureEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
            <input
              type="checkbox"
              id="votingRights"
              checked={votingRights}
              onChange={(e) => setVotingRights(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="votingRights" className="text-slate-200 font-medium cursor-pointer">
              Grant Official Voting Authority on Disciplinary Verdicts
            </label>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Appointment Mandate Notes</label>
            <input
              type="text"
              value={appointmentNotes}
              onChange={(e) => setAppointmentNotes(e.target.value)}
              placeholder="e.g. Oversight on nursing standards and patient advocacy"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. SUBMIT QUERY DEFENSE MODAL
// ----------------------------------------------------
interface SubmitQueryDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: StaffQuery | null;
}

export const SubmitQueryDefenseModal: React.FC<SubmitQueryDefenseModalProps> = ({
  isOpen,
  onClose,
  query,
}) => {
  const { submitStaffQueryResponse, currentUser } = useHrms();

  const [plea, setPlea] = useState<StaffQuery['staffResponse']['plea']>('Mitigating Circumstances');
  const [explanation, setExplanation] = useState<string>('');
  const [docName, setDocName] = useState<string>('');

  if (!isOpen || !query) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      alert('Please enter your written explanation statement.');
      return;
    }

    const docs = docName.trim() ? [{ name: docName.trim() }] : [];

    submitStaffQueryResponse(query.id, {
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      plea,
      explanation: explanation.trim(),
      supportingDocuments: docs,
      submittedByName: currentUser?.name || query.staffName,
      signatureDate: new Date().toISOString().slice(0, 10),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Submit Formal Written Defense</h3>
              <p className="text-xs text-slate-400">Response to Query {query.queryNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Query Recap */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-rose-400">Query In Reference:</span>
            <h4 className="font-bold text-white text-xs">{query.subject}</h4>
            <p className="text-slate-300 text-xs">{query.allegationDetails}</p>
          </div>

          {/* Plea Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Formal Plea / Position *</label>
            <select
              value={plea}
              onChange={(e) => setPlea(e.target.value as StaffQuery['staffResponse']['plea'])}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Admitted / Apologetic">Admitted & Apologetic (Accept facts with regret)</option>
              <option value="Mitigating Circumstances">Mitigating Circumstances (Extenuating emergency/health factors)</option>
              <option value="Denied with Evidence">Denied with Evidence (Contest allegations with proof)</option>
              <option value="Request Formal Hearing">Request Formal In-Person Tribunal Hearing</option>
            </select>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Comprehensive Defense Statement *</label>
            <textarea
              rows={5}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="State your side of the events clearly, detailing circumstances, timeline, communications made, and any corrective actions taken..."
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Supporting Docs */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Attached Supporting Document / Proof</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Police_Accident_Report_Slip.pdf or Medical_Certificate.pdf"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] text-slate-300">
            By submitting this defense, I confirm that the statements provided are true and accurate under penalty of
            disciplinary sanction.
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition"
            >
              Submit Written Defense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. SCHEDULE DISCIPLINARY HEARING MODAL
// ----------------------------------------------------
interface ScheduleHearingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedQuery?: StaffQuery | null;
}

export const ScheduleHearingModal: React.FC<ScheduleHearingModalProps> = ({
  isOpen,
  onClose,
  preselectedQuery,
}) => {
  const { staffQueries, disciplinaryBoardMembers, scheduleDisciplinaryHearing } = useHrms();

  const [selectedQueryId, setSelectedQueryId] = useState<string>(preselectedQuery?.id || '');
  const [hearingDate, setHearingDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [hearingTime, setHearingTime] = useState<string>('10:00 AM - 12:00 PM');
  const [venue, setVenue] = useState<string>('Executive Council Boardroom / Wing A, Level 4');
  const [chargesSummary, setChargesSummary] = useState<string>(preselectedQuery?.allegationDetails || '');
  const [witnessesInput, setWitnessesInput] = useState<string>('');

  if (!isOpen) return null;

  const targetQuery = staffQueries.find((q) => q.id === selectedQueryId) || preselectedQuery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQuery) {
      alert('Please select a query to convene hearing for.');
      return;
    }

    const panel = disciplinaryBoardMembers
      .filter((m) => m.status === 'Active')
      .map((m) => `${m.name} (${m.boardRole})`);

    const witnesses = witnessesInput
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);

    scheduleDisciplinaryHearing({
      queryId: targetQuery.id,
      queryNumber: targetQuery.queryNumber,
      accusedStaffId: targetQuery.staffId,
      accusedStaffName: targetQuery.staffName,
      accusedStaffEmpCode: targetQuery.staffEmpCode,
      accusedStaffDept: targetQuery.staffDepartment,
      accusedStaffRole: targetQuery.staffRole,
      hearingDate,
      hearingTime,
      venue,
      presidingPanel: panel,
      secretaryName: 'Miss Vero',
      complainantOrWitnesses: witnesses,
      chargesSummary: chargesSummary || targetQuery.allegationDetails,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Convene Disciplinary Tribunal Hearing</h3>
              <p className="text-xs text-slate-400">Summon Standing Disciplinary Panel for oral proceedings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Query Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Case Query *</label>
            <select
              value={selectedQueryId}
              onChange={(e) => {
                setSelectedQueryId(e.target.value);
                const q = staffQueries.find((item) => item.id === e.target.value);
                if (q) setChargesSummary(q.allegationDetails);
              }}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">-- Choose Query Case --</option>
              {staffQueries.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.queryNumber} — {q.staffName} [{q.subject}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hearing Date *</label>
              <input
                type="date"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hearing Time Slot *</label>
              <input
                type="text"
                value={hearingTime}
                onChange={(e) => setHearingTime(e.target.value)}
                required
                placeholder="10:00 AM - 12:00 PM"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tribunal Boardroom / Venue *</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Terms of Reference & Summary of Charges</label>
            <textarea
              rows={3}
              value={chargesSummary}
              onChange={(e) => setChargesSummary(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Complainants / Witnesses (Comma Separated)</label>
            <input
              type="text"
              value={witnessesInput}
              onChange={(e) => setWitnessesInput(e.target.value)}
              placeholder="e.g. Unit Nurse Lead, Lead Surgeon, CSSD Technician"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400 shrink-0" />
            <span>Active Board Panelists will be auto-assigned to presiding tribunal bench.</span>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition"
            >
              Schedule Hearing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. RECORD VERDICT MODAL
// ----------------------------------------------------
interface RecordVerdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  query?: StaffQuery | null;
  hearing?: DisciplinaryHearing | null;
}

export const RecordVerdictModal: React.FC<RecordVerdictModalProps> = ({
  isOpen,
  onClose,
  query,
  hearing,
}) => {
  const { recordHearingVerdict, updateStaffQueryStatus } = useHrms();

  const [outcome, setOutcome] = useState<DisciplinarySanction>('Written Warning / Reprimand');
  const [justification, setJustification] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [chairmanName, setChairmanName] = useState<string>('Rev. Fr. Mike');
  const [secretaryName, setSecretaryName] = useState<string>('Miss Vero');

  if (!isOpen) return null;

  const targetStaffName = hearing?.accusedStaffName || query?.staffName || 'Staff Member';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      alert('Please enter tribunal justification.');
      return;
    }

    const appealDate = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const verdict = {
      outcome,
      justification: justification.trim(),
      effectiveDate,
      signedByChairman: chairmanName,
      signedBySecretary: secretaryName,
      signedDate: new Date().toISOString().slice(0, 10),
      appealDeadlineDate: appealDate,
    };

    if (hearing) {
      recordHearingVerdict(hearing.id, verdict, 'Verdict Delivered');
    } else if (query) {
      updateStaffQueryStatus(query.id, 'Verdict Delivered', {
        sanctionApplied: outcome,
        resolvedDate: effectiveDate,
        resolvedBy: chairmanName,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Record Disciplinary Decision & Verdict</h3>
              <p className="text-xs text-slate-400">Promulgate tribunal ruling for {targetStaffName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Disciplinary Sanction / Decision *</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as DisciplinarySanction)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Exonerated / Case Dismissed">Exonerated / Case Dismissed (No Fault Found)</option>
              <option value="Formal Verbal Warning">Formal Verbal Warning (Recorded in Personnel File)</option>
              <option value="Written Warning / Reprimand">Written Warning / Reprimand</option>
              <option value="Final Written Warning">Final Written Warning</option>
              <option value="Suspension With Half Pay">Suspension With Half Pay (1 - 4 Weeks)</option>
              <option value="Suspension Without Pay">Suspension Without Pay</option>
              <option value="Demotion / Reduction in Rank">Demotion / Reduction in Rank</option>
              <option value="Salary Withholding / Surcharge">Salary Withholding / Surcharge</option>
              <option value="Summary Dismissal / Termination">Summary Dismissal / Termination</option>
              <option value="Referral to Medical and Dental Council / Nursing Council">
                Referral to Medical & Dental / Nursing & Midwifery Council
              </option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Detailed Findings & Legal Justification *</label>
            <textarea
              rows={4}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Outline the factors considered, admissibility of defense, mitigating or aggravating circumstances..."
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Effective Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Chair Signatory</label>
              <input
                type="text"
                value={chairmanName}
                onChange={(e) => setChairmanName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Secretary Signatory</label>
              <input
                type="text"
                value={secretaryName}
                onChange={(e) => setSecretaryName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-[11px]">
            Notice: Per Section 15 of Hospital Disciplinary Code, the employee retains a statutory right to appeal this
            decision to the Board of Governors within 14 calendar days of promulgation.
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition"
            >
              Promulgate Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 6. OFFICIAL A4 PRINT PREVIEW & EDITABLE QUERY MEMORANDUM MODAL
// ----------------------------------------------------
interface QueryLetterMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: StaffQuery | null;
}

export const QueryLetterMemoModal: React.FC<QueryLetterMemoModalProps> = ({
  isOpen,
  onClose,
  query,
}) => {
  const { updateStaffQuery } = useHrms();

  const [copied, setCopied] = useState(false);
  const [zoomScale, setZoomScale] = useState<'fit' | '100' | '115'>('100');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  // Editable Memo States
  const [memoRef, setMemoRef] = useState<string>('');
  const [dateIssued, setDateIssued] = useState<string>('');
  const [issuedByName, setIssuedByName] = useState<string>('');
  const [issuedByRole, setIssuedByRole] = useState<string>('');
  const [throughRouting, setThroughRouting] = useState<string>('Head of Department / Unit Head');
  const [authorityTier, setAuthorityTier] = useState<QueryAuthorityTier>('hr');
  const [subject, setSubject] = useState<string>('');
  const [misconductCategory, setMisconductCategory] = useState<MisconductCategory>('Absenteeism & Chronic Lateness');
  const [severity, setSeverity] = useState<StaffQuery['severity']>('High');
  const [incidentDate, setIncidentDate] = useState<string>('');
  const [incidentLocation, setIncidentLocation] = useState<string>('');
  const [allegationDetails, setAllegationDetails] = useState<string>('');
  const [policyClauseViolated, setPolicyClauseViolated] = useState<string>('');
  const [responseDeadlineHours, setResponseDeadlineHours] = useState<number>(48);
  const [responseDeadlineDate, setResponseDeadlineDate] = useState<string>('');
  const [ccList, setCcList] = useState<string>(
    '• Chief Executive Officer / Medical Director\n• Director of Clinical & Nursing Services\n• Head of Department / Unit In-Charge\n• Chairman, Standing Disciplinary Committee\n• Confidential Personnel Dossier'
  );

  // Initialize or re-sync when query changes or modal opens
  useEffect(() => {
    if (query) {
      setMemoRef(query.queryNumber || '');
      setDateIssued(query.dateIssued || new Date().toISOString().slice(0, 10));
      setIssuedByName(query.issuedBy || 'Miss Veronica Ansah');
      setIssuedByRole(query.issuedByRole || 'Director of Human Resources & Legal Affairs');
      setSubject(query.subject || '');
      setMisconductCategory(query.misconductCategory || 'Absenteeism & Chronic Lateness');
      setSeverity(query.severity || 'High');
      setIncidentDate(query.incidentDate || new Date().toISOString().slice(0, 10));
      setIncidentLocation(query.incidentLocation || `${query.staffDepartment} Ward / Hospital Grounds`);
      setAllegationDetails(query.allegationDetails || '');
      setPolicyClauseViolated(query.policyClauseViolated || 'PJPIIMC Staff Handbook Section 14.2 & Code of Conduct');
      setResponseDeadlineHours(query.responseDeadlineHours || 48);
      setResponseDeadlineDate(query.responseDeadlineDate || '');

      // Determine initial authority tier
      const roleLower = (query.issuedByRole || '').toLowerCase();
      if (roleLower.includes('unit') || roleLower.includes('ward')) {
        setAuthorityTier('unit_head');
        setThroughRouting('Head of Department');
      } else if (roleLower.includes('dept') || roleLower.includes('hod') || roleLower.includes('head of dep')) {
        setAuthorityTier('dept_head');
        setThroughRouting('Directorate of HR & Legal Affairs');
      } else if (roleLower.includes('facility') || roleLower.includes('medical director') || roleLower.includes('ceo')) {
        setAuthorityTier('facility_head');
        setThroughRouting('Direct Executive Command');
      } else {
        setAuthorityTier('hr');
        setThroughRouting(`Head of Department (${query.staffDepartment}) / Unit Head`);
      }
      setIsSavedSuccess(false);
    }
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !query) return null;

  const handleAuthorityTierChange = (tier: QueryAuthorityTier) => {
    setAuthorityTier(tier);
    if (tier === 'unit_head') {
      setIssuedByRole('Unit Head / Ward In-Charge');
      setThroughRouting(`Head of Department (${query.staffDepartment})`);
    } else if (tier === 'dept_head') {
      setIssuedByRole(`Head of Department (${query.staffDepartment})`);
      setThroughRouting('Directorate of HR & Legal Affairs');
    } else if (tier === 'facility_head') {
      setIssuedByRole('Medical Director / Head of Facility (CEO)');
      setThroughRouting('Direct Executive Command');
    } else {
      setIssuedByRole('Director of Human Resources & Legal Governance');
      setThroughRouting(`Head of Department (${query.staffDepartment}) / Unit Head`);
    }
  };

  const handleDeadlineHoursChange = (hours: number) => {
    setResponseDeadlineHours(hours);
    const newDeadline = new Date(Date.now() + hours * 3600 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 16);
    setResponseDeadlineDate(newDeadline);
  };

  const handleSaveChanges = () => {
    if (!query) return;
    updateStaffQuery(query.id, {
      queryNumber: memoRef.trim() || query.queryNumber,
      dateIssued: dateIssued.trim() || query.dateIssued,
      issuedBy: issuedByName.trim() || query.issuedBy,
      issuedByRole: issuedByRole.trim() || query.issuedByRole,
      subject: subject.trim() || query.subject,
      misconductCategory,
      severity,
      incidentDate,
      incidentLocation: incidentLocation.trim() || query.incidentLocation,
      allegationDetails: allegationDetails.trim() || query.allegationDetails,
      policyClauseViolated: policyClauseViolated.trim() || query.policyClauseViolated,
      responseDeadlineHours,
      responseDeadlineDate: responseDeadlineDate.trim() || query.responseDeadlineDate,
    });
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const handleResetToOriginal = () => {
    if (!query) return;
    setMemoRef(query.queryNumber || '');
    setDateIssued(query.dateIssued || '');
    setIssuedByName(query.issuedBy || '');
    setIssuedByRole(query.issuedByRole || '');
    setSubject(query.subject || '');
    setMisconductCategory(query.misconductCategory || 'Absenteeism & Chronic Lateness');
    setSeverity(query.severity || 'High');
    setIncidentDate(query.incidentDate || '');
    setIncidentLocation(query.incidentLocation || '');
    setAllegationDetails(query.allegationDetails || '');
    setPolicyClauseViolated(query.policyClauseViolated || '');
    setResponseDeadlineHours(query.responseDeadlineHours || 48);
    setResponseDeadlineDate(query.responseDeadlineDate || '');
    setIsSavedSuccess(false);
  };

  const handlePrint = () => {
    printElementById('query-memo-printable-content', `PJPIIMC_Query_Memo_${memoRef || query.queryNumber}`, {
      title: `Official Query Memorandum - ${query.staffName} (${memoRef || query.queryNumber})`,
    });
  };

  const handleDownload = () => {
    const el = document.getElementById('query-memo-printable-content');
    if (el) {
      downloadPrintableHtml(
        el.innerHTML,
        `PJPIIMC_Query_Memo_${memoRef || query.queryNumber}_${query.staffEmpCode}`,
        `Official Query Memorandum - ${query.staffName}`
      );
    }
  };

  const handleCopyText = () => {
    const memoText = `POPE JOHN PAUL II MEDICAL CENTRE
CATHOLIC DIOCESAN HEALTH SERVICES • ARCHDIOCESE OF ACCRA
DIRECTORATE OF HUMAN RESOURCE MANAGEMENT, LEGAL AFFAIRS & PROFESSIONAL ETHICS
MEMORANDUM REF: ${memoRef || query.queryNumber}
DATE ISSUED: ${dateIssued || query.dateIssued}
RESPONSE DEADLINE: ${responseDeadlineDate || query.responseDeadlineDate} (${responseDeadlineHours} Hours)

TO (STAFF): ${query.staffName} (${query.staffEmpCode})
RANK / POSITION: ${query.staffRole}
DEPARTMENT: ${query.staffDepartment}
THROUGH: ${throughRouting}
FROM: ${issuedByName} (${issuedByRole})
SUBJECT: FORMAL QUERY IN RESPECT OF ALLEGED ${(subject || query.subject).toUpperCase()}

PARTICULARS OF ALLEGATION:
"${allegationDetails || query.allegationDetails}"

BREACH CITED:
${policyClauseViolated || query.policyClauseViolated} (Section 14 of the PJPIIMC Staff Handbook & Code of Conduct)

In accordance with the fundamental principles of natural justice and Section 62 of the Labour Act, 2003 (Act 651) of Ghana, you are hereby requested to submit a formal written explanation to the undersigned within ${responseDeadlineHours} hours of service (on or before ${responseDeadlineDate || query.responseDeadlineDate}), showing cause why disciplinary proceedings should not be instituted against you.

Please take formal notice that failure to submit your written defense within the stipulated deadline shall be deemed an admission of the allegations, and the Standing Disciplinary Committee may proceed to determine the matter ex-parte.

Issued By: ${issuedByName}, ${issuedByRole}
Pope John Paul II Medical Centre`;

    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="printable-query-memo-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="printable-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto"
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 14mm 10mm 14mm;
          }
          body, html, #root, #root > div {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .query-memo-printable {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10pt !important;
            line-height: 1.42 !important;
          }
          .query-memo-printable * {
            color: #000000 !important;
          }
          .query-memo-printable h1, 
          .query-memo-printable h2, 
          .query-memo-printable h3, 
          .query-memo-printable h4 {
            color: #000000 !important;
          }
          .query-memo-printable .print-border-dark {
            border-color: #000000 !important;
          }
          .no-print, .print\\:hidden {
            display: none !important;
          }
          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        className="printable-document-card relative w-full max-w-6xl rounded-2xl bg-slate-900 text-white shadow-2xl overflow-hidden my-2 sm:my-4 border border-slate-700/80 flex flex-col max-h-[96vh]"
      >
        {/* Modal Top Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">
                  Official Query Memorandum • {isEditMode ? 'Interactive Editor Mode' : 'Print Preview Mode'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  A4 Portrait
                </span>
                {isSavedSuccess && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                    <Check className="h-3 w-3" /> Saved!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Staff: <span className="text-white font-medium">{query.staffName}</span> ({query.staffEmpCode}) • Ref:{' '}
                <span className="font-mono text-emerald-400 font-bold">{memoRef || query.queryNumber}</span>
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Edit / Preview Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                isEditMode
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title={isEditMode ? 'Switch to Full Print Preview' : 'Edit Query Memo Particulars'}
            >
              {isEditMode ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>View A4 Layout</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Memo</span>
                </>
              )}
            </button>

            {/* Zoom Toggle Controls (Desktop) */}
            <div className="hidden lg:flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setZoomScale('fit')}
                className={`px-2 py-1 rounded-lg font-medium transition ${
                  zoomScale === 'fit' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Fit to Window"
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => setZoomScale('100')}
                className={`px-2 py-1 rounded-lg font-medium transition ${
                  zoomScale === '100' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="100% Standard Scale"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale('115')}
                className={`px-2 py-1 rounded-lg font-medium transition ${
                  zoomScale === '115' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="115% Enlarged View"
              >
                115%
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Copy Memo Text"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="Download Offline HTML / PDF"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Offline File</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              <Printer className="h-4 w-4" />
              <span>Print Official Memo</span>
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-300 text-xs font-medium border border-slate-700 transition"
              title="Close Preview (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area: Editor Panel + A4 Document Viewport */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-slate-950/90 flex flex-col lg:flex-row gap-6 items-start justify-center">
          
          {/* Collapsible/Toggleable Interactive Edit Sidebar */}
          {isEditMode && (
            <div className="w-full lg:w-[420px] shrink-0 bg-slate-900 border border-slate-700/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-xs max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-amber-400" />
                  <span className="font-bold text-sm text-white">Customize Memo Particulars</span>
                </div>
                <button
                  onClick={handleResetToOriginal}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 transition"
                  title="Reset to Original"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              {/* Statutory Authority Governance Callout */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-200">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                  Authorized Querying Leadership Tiers
                </div>
                <p className="text-slate-300 text-[10.5px]">
                  Only Unit Heads, Departmental Heads, HR Directorate, and Head of Facility are statutory authorities.
                </p>
              </div>

              {/* Issuing Authority Tier Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Authority Tier *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAuthorityTierChange('unit_head')}
                    className={`p-2 rounded-xl border text-left transition ${
                      authorityTier === 'unit_head'
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs text-rose-300">Unit Head</span>
                    <span className="text-[10px] text-slate-400 block">Ward In-Charge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuthorityTierChange('dept_head')}
                    className={`p-2 rounded-xl border text-left transition ${
                      authorityTier === 'dept_head'
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs text-rose-300">Dept. Head</span>
                    <span className="text-[10px] text-slate-400 block">HOD / Division</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuthorityTierChange('hr')}
                    className={`p-2 rounded-xl border text-left transition ${
                      authorityTier === 'hr'
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs text-rose-300">HR Directorate</span>
                    <span className="text-[10px] text-slate-400 block">HR & Ethics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuthorityTierChange('facility_head')}
                    className={`p-2 rounded-xl border text-left transition ${
                      authorityTier === 'facility_head'
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs text-rose-300">Facility Head</span>
                    <span className="text-[10px] text-slate-400 block">Medical Dir / CEO</span>
                  </button>
                </div>
              </div>

              {/* Memo Reference & Date Issued */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Memo Ref No.</label>
                  <input
                    type="text"
                    value={memoRef}
                    onChange={(e) => setMemoRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date of Issuance</label>
                  <input
                    type="date"
                    value={dateIssued}
                    onChange={(e) => setDateIssued(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Issued By & Title */}
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issuing Officer Name</label>
                  <input
                    type="text"
                    value={issuedByName}
                    onChange={(e) => setIssuedByName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issuing Officer Designation</label>
                  <input
                    type="text"
                    value={issuedByRole}
                    onChange={(e) => setIssuedByRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Through (Routing)</label>
                  <input
                    type="text"
                    value={throughRouting}
                    onChange={(e) => setThroughRouting(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Query Subject / Alleged Matter</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Misconduct Category & Severity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={misconductCategory}
                    onChange={(e) => setMisconductCategory(e.target.value as MisconductCategory)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Absenteeism & Chronic Lateness">Absenteeism</option>
                    <option value="Clinical Negligence / Protocol Breach">Clinical Negligence</option>
                    <option value="Financial & Billing Irregularity">Financial Irregularity</option>
                    <option value="Workplace Harassment / Unprofessional Conduct">Harassment</option>
                    <option value="Insubordination & Refusal of Lawful Duty">Insubordination</option>
                    <option value="Confidentiality & HIPAA / Data Breach">Data Breach</option>
                    <option value="Medication & Prescription Discrepancy">Medication Issue</option>
                    <option value="Substance Abuse on Duty">Substance Abuse</option>
                    <option value="Fraudulent Certification / Misrepresentation">Fraud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as StaffQuery['severity'])}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Minor">Minor</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical / Gross Misconduct">Gross Misconduct</option>
                  </select>
                </div>
              </div>

              {/* Statement of Allegation */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Statement of Allegation & Facts</label>
                <textarea
                  rows={4}
                  value={allegationDetails}
                  onChange={(e) => setAllegationDetails(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs leading-relaxed focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Policy Clause Violated */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Breach / Policy Clause Cited</label>
                <input
                  type="text"
                  value={policyClauseViolated}
                  onChange={(e) => setPolicyClauseViolated(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Response Window Hours */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Response Window</label>
                  <select
                    value={responseDeadlineHours}
                    onChange={(e) => handleDeadlineHoursChange(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value={24}>24 Hours (Urgent)</option>
                    <option value={48}>48 Hours (Standard)</option>
                    <option value={72}>72 Hours (Complex)</option>
                    <option value={120}>5 Business Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deadline Date & Time</label>
                  <input
                    type="text"
                    value={responseDeadlineDate}
                    onChange={(e) => setResponseDeadlineDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Incident Date & Location */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Incident Location</label>
                  <input
                    type="text"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Distribution C.C. */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Distribution List (C.C.)</label>
                <textarea
                  rows={3}
                  value={ccList}
                  onChange={(e) => setCcList(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Save Changes Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes to Official Record</span>
                </button>
              </div>
            </div>
          )}

          {/* Authentic Physical A4 Sheet Container (Real-Time Live Render) */}
          <div className="flex-1 flex justify-center w-full">
            <div
              id="query-memo-printable-content"
              style={{
                transform: zoomScale === '115' ? 'scale(1.06)' : zoomScale === 'fit' ? 'scale(0.92)' : 'none',
                transformOrigin: 'top center',
              }}
              className="query-memo-printable w-full max-w-[760px] bg-white text-slate-950 rounded-sm shadow-2xl ring-1 ring-black/15 p-8 sm:p-10 md:p-12 space-y-4 font-serif leading-relaxed text-xs sm:text-[13px] relative transition-transform duration-200 print:transform-none print:shadow-none print:ring-0 print:p-0 print:max-w-full"
            >
              
              {/* Subtle Institutional Watermark Crest */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none print:opacity-[0.025]">
                <PjpiimcLogo size="hero" className="w-80 h-80" />
              </div>

              {/* Formal Official Institutional Letterhead */}
              <div className="text-center pb-2.5 relative">
                <div className="flex items-center justify-center gap-3.5 mb-1">
                  <PjpiimcLogo size="md" className="shrink-0 print:w-14 print:h-14" />
                  <div className="text-center">
                    <h1 className="font-serif font-black text-base sm:text-lg text-slate-950 tracking-[0.14em] uppercase leading-tight">
                      Pope John Paul II Medical Centre
                    </h1>
                    <p className="font-sans text-[10px] sm:text-[11px] text-slate-800 font-bold tracking-[0.12em] uppercase mt-0.5">
                      Catholic Diocesan Health Services • Archdiocese of Accra
                    </p>
                    <p className="font-sans text-[9px] sm:text-[9.5px] text-slate-600 font-semibold tracking-wider uppercase">
                      Member of the Christian Health Association of Ghana (CHAG)
                    </p>
                    <p className="font-sans text-[10px] sm:text-[10.5px] text-emerald-850 font-bold tracking-wide uppercase text-emerald-800 mt-0.5">
                      {authorityTier === 'unit_head'
                        ? 'Unit Clinical Operations & Quality Assurance Directorate'
                        : authorityTier === 'dept_head'
                        ? `Department of ${query.staffDepartment} • Directorate of Clinical Governance`
                        : authorityTier === 'facility_head'
                        ? 'Office of the Medical Director & Chief Executive Officer'
                        : 'Directorate of Human Resource Management, Legal Affairs & Ethics'}
                    </p>
                  </div>
                </div>
                
                {/* Contact Details Line */}
                <p className="font-sans text-[8.5px] sm:text-[9.5px] text-slate-600 tracking-tight mt-1">
                  Independence Avenue, Airport Residential • P.O. Box 481, Accra, Ghana • Tel: +233 (0) 302 778 900 • Digital Address: GA-142-8821 • Email: hr.governance@pjpiimc.org
                </p>

                {/* Formal Commonwealth Double Header Rule */}
                <div className="mt-2 space-y-[2px]">
                  <div className="h-[2.5px] bg-slate-950 w-full" />
                  <div className="h-[0.75px] bg-slate-950 w-full" />
                </div>
              </div>

              {/* Official Memorandum Title Header */}
              <div className="text-center font-sans space-y-0.5 pt-1">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-slate-950">
                  Internal Memorandum
                </h2>
                <div className="inline-block px-3 py-0.5 rounded bg-slate-100 border border-slate-300 font-extrabold text-[10.5px] sm:text-xs uppercase tracking-widest text-slate-900">
                  Formal Disciplinary Query • Strictly Confidential
                </div>
              </div>

              {/* Formal Metadata Routing Grid */}
              <div className="font-sans border-2 border-slate-900 rounded overflow-hidden text-[11px] sm:text-xs">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-300 divide-x divide-slate-300 bg-slate-50/70">
                      <td className="p-2 w-1/2">
                        <strong className="text-slate-800 font-bold">TO (STAFF):</strong>{' '}
                        <span className="font-bold text-slate-950">{query.staffName}</span> ({query.staffEmpCode})
                      </td>
                      <td className="p-2 w-1/2">
                        <strong className="text-slate-800 font-bold">MEMO REF NO:</strong>{' '}
                        <span className="font-mono font-bold text-slate-950">{memoRef || query.queryNumber}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300 divide-x divide-slate-300">
                      <td className="p-2">
                        <strong className="text-slate-800 font-bold">RANK / POSITION:</strong>{' '}
                        <span className="text-slate-900">{query.staffRole}</span>
                      </td>
                      <td className="p-2">
                        <strong className="text-slate-800 font-bold">DATE OF ISSUANCE:</strong>{' '}
                        <span className="text-slate-900">{dateIssued || query.dateIssued}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300 divide-x divide-slate-300 bg-slate-50/70">
                      <td className="p-2">
                        <strong className="text-slate-800 font-bold">DEPARTMENT / UNIT:</strong>{' '}
                        <span className="text-slate-900">{query.staffDepartment}</span>
                      </td>
                      <td className="p-2">
                        <strong className="text-slate-800 font-bold">RESPONSE DEADLINE:</strong>{' '}
                        <span className="font-bold text-rose-700 underline">{responseDeadlineDate || query.responseDeadlineDate}</span>{' '}
                        <span className="font-semibold text-slate-700">({responseDeadlineHours} Hours)</span>
                      </td>
                    </tr>
                    <tr className="divide-x divide-slate-300">
                      <td className="p-2">
                        <strong className="text-slate-800 font-bold">THROUGH:</strong>{' '}
                        <span className="text-slate-900">{throughRouting}</span>
                      </td>
                      <td className="p-2">
                        <strong className="text-slate-800 font-bold">SEVERITY LEVEL:</strong>{' '}
                        <span className="font-bold uppercase text-slate-950">{severity || query.severity}</span>
                      </td>
                    </tr>
                    <tr className="border-t border-slate-300 divide-x divide-slate-300 bg-slate-50/40">
                      <td colSpan={2} className="p-2">
                        <strong className="text-slate-800 font-bold">FROM (ISSUING AUTHORITY):</strong>{' '}
                        <span className="font-bold text-slate-950">{issuedByName || query.issuedBy}</span>, {issuedByRole || query.issuedByRole}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Formal Subject Line */}
              <div className="font-sans font-bold text-xs sm:text-[13px] uppercase tracking-wide py-1 border-b-2 border-slate-900">
                <span className="text-slate-900">SUBJECT:</span>{' '}
                <span className="underline decoration-slate-950 decoration-2">
                  FORMAL QUERY IN RESPECT OF ALLEGED {subject || query.subject}
                </span>
              </div>

              {/* Substantive Legal Narrative Body */}
              <div className="space-y-2.5 text-justify text-slate-950 text-xs sm:text-[12.5px] leading-relaxed">
                <p>
                  1. It has come to the official notice of Hospital Management and the Directorate of Human Resources, Legal Governance & Professional Ethics that on or about{' '}
                  <strong>{incidentDate || query.incidentDate}</strong> at <strong>{incidentLocation || query.incidentLocation || 'the Hospital Premises'}</strong>, you allegedly conducted yourself in a manner constituting suspected{' '}
                  <strong>{misconductCategory || query.misconductCategory}</strong>, to wit:
                </p>

                {/* Indented Allegation Excerpt */}
                <div className="my-2 p-3 sm:p-3.5 bg-slate-50 border-l-4 border-slate-950 rounded-r font-sans text-xs sm:text-[12px] text-slate-900 leading-normal italic">
                  "{allegationDetails || query.allegationDetails}"
                </div>

                <p>
                  2. The aforesaid conduct, if substantiated, represents a severe contravention of{' '}
                  <strong>{policyClauseViolated || query.policyClauseViolated}</strong>, Section 14 of the PJPIIMC Staff Handbook & Disciplinary Code, as well as the ethical standards governing healthcare professionals under the statutory regulations of the Medical & Dental Council / Nursing & Midwifery Council frameworks.
                </p>

                <p>
                  3. In accordance with the tenets of natural justice and Section 62 of the Labour Act, 2003 (Act 651) of Ghana, you are hereby requested to submit a formal written explanation to the undersigned within{' '}
                  <strong>{responseDeadlineHours} hours</strong> of service of this memorandum (on or before{' '}
                  <strong className="underline">{responseDeadlineDate || query.responseDeadlineDate}</strong>), showing cause why disciplinary proceedings and sanctions should not be instituted against you.
                </p>

                <p className="font-bold text-slate-950">
                  4. Please take formal notice that failure to submit your written defense within the stipulated statutory timeline shall be deemed an admission of the allegations, and the Standing Disciplinary Committee may proceed to determine the matter ex-parte.
                </p>
              </div>

              {/* Signature & Endorsement Block */}
              <div className="pt-2 grid grid-cols-2 gap-6 font-sans text-[10.5px] sm:text-xs page-break-avoid">
                <div>
                  <p className="text-slate-600 uppercase text-[9.5px] font-bold tracking-wider mb-6">Issued & Endorsed By:</p>
                  <div className="w-52 border-b-2 border-slate-900 pb-1 font-bold text-slate-950">
                    {issuedByName || query.issuedBy}
                  </div>
                  <p className="font-bold text-slate-900 mt-0.5">{issuedByRole || query.issuedByRole}</p>
                  <p className="text-slate-600 text-[10px]">
                    {authorityTier === 'facility_head'
                      ? 'Executive Directorate / Head of Facility'
                      : authorityTier === 'dept_head'
                      ? `Department of ${query.staffDepartment}`
                      : authorityTier === 'unit_head'
                      ? 'Unit Operations / Clinical Nursing'
                      : 'Directorate of HR Management & Legal Affairs'}
                  </p>
                  <p className="text-slate-500 text-[9px]">Pope John Paul II Medical Centre</p>
                </div>

                <div className="text-right text-[9.5px] sm:text-[10px] text-slate-700 space-y-0.5">
                  <p className="font-bold text-slate-950 uppercase tracking-wider text-[10px] mb-1">Distribution (C.C.):</p>
                  {ccList.split('\n').map((item, idx) => (
                    <p key={idx}>{item}</p>
                  ))}
                </div>
              </div>

              {/* Formal Service of Process & Acknowledgement Receipt Slip */}
              <div className="mt-3 pt-3 border-t-2 border-dashed border-slate-400 font-sans text-[10px] sm:text-[10.5px] text-slate-900 space-y-2 page-break-avoid">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-950">
                  <span>✂ Certificate of Personal Service & Staff Acknowledgement Slip</span>
                  <span className="font-mono text-[9px] text-slate-600 font-normal">Ref: {memoRef || query.queryNumber}</span>
                </div>
                
                <p className="text-slate-800 text-[9.5px] sm:text-[10px] italic">
                  I, <strong>{query.staffName}</strong> (Staff ID: {query.staffEmpCode}), hereby certify that I have this day received the original copy of this Formal Query Memorandum and acknowledge the {responseDeadlineHours}-hour statutory submission deadline.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-1 text-[9.5px]">
                  <div className="border-b border-slate-800 pb-1">
                    <span className="text-[8.5px] text-slate-500 block font-semibold">Staff Signature:</span>
                    <span className="text-slate-400 italic">Sign here on receipt</span>
                  </div>
                  <div className="border-b border-slate-800 pb-1">
                    <span className="text-[8.5px] text-slate-500 block font-semibold">Date & Time Served:</span>
                    <span className="text-slate-700 font-mono">____ / ____ / 2026 @ ____:____</span>
                  </div>
                  <div className="border-b border-slate-800 pb-1">
                    <span className="text-[8.5px] text-slate-500 block font-semibold">Serving Officer Signature:</span>
                    <span className="text-slate-400 italic">Witness & stamp</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Bottom Quit / Action Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900 border-t border-slate-800 shrink-0 font-sans">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {isEditMode ? 'Live Editor Active • Changes Synchronized to A4 Sheet' : 'A4 Document Preview Ready • Scale: 1:1 Print Alignment'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                onClick={handleSaveChanges}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
              title="Download Offline HTML / PDF"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>Save Offline File</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              <Printer className="h-4 w-4" />
              <span>Print Official Memo (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition border border-slate-700"
            >
              <X className="h-4 w-4" />
              <span>Close Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

