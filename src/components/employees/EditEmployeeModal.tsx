import React, { useState } from 'react';
import {
  X,
  User,
  FileText,
  GraduationCap,
  Phone,
  Briefcase,
  GitCommit,
  Award,
  HeartPulse,
  Save,
  CheckCircle2,
  Upload,
  Plus,
  Trash2,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  FileCheck,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  Employee,
  MedicalLicense,
  VaccinationRecord,
  OfficialDocument,
  TransferType,
  EmploymentSource,
  StaffFile,
} from '../../types/hrms';
import { EmployeePhotoUploader } from '../common/EmployeePhotoUploader';

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSave: (updated: Employee) => void;
  onDelete?: (emp: Employee) => void;
  staffFiles: StaffFile[];
  uploadStaffFile?: (fileData: any) => Promise<StaffFile>;
  recordStaffMovement?: (movementData: any) => void;
  formatCurrency: (amount: number) => string;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  onClose,
  onSave,
  onDelete,
  staffFiles,
  formatCurrency,
}) => {
  const [editingEmployee, setEditingEmployee] = useState<Employee>({ ...employee });
  const [editActiveTab, setEditActiveTab] = useState<
    'general' | 'documents' | 'education' | 'contacts' | 'employment' | 'movements' | 'licenses' | 'health' | 'security'
  >('general');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Portal Security & Password Management State inside Edit Modal
  const [showPassword, setShowPassword] = useState(false);
  const [newPortalPassword, setNewPortalPassword] = useState(
    editingEmployee.customPassword || editingEmployee.portalAccess?.customPassword || editingEmployee.portalAccess?.tempPassword || editingEmployee.empCode
  );

  const handleGeneratePassword = () => {
    const prefixes = ['Hospital', 'StJude', 'PJPIIMC', 'Health', 'GhanaMed', 'Care'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const year = '2026';
    const special = ['!', '#', '@', '$'][Math.floor(Math.random() * 4)];
    const num = Math.floor(100 + Math.random() * 900);
    const pass = `${prefix}${year}${special}${num}`;
    setNewPortalPassword(pass);
    setShowPassword(true);
    setEditingEmployee((prev) => ({
      ...prev,
      customPassword: pass,
      portalAccess: {
        ...prev.portalAccess,
        username: prev.portalAccess?.username || prev.email || prev.empCode,
        usernameType: prev.portalAccess?.usernameType || 'email',
        tempPassword: pass,
        passwordType: 'custom',
        accountCreated: true,
        accountCreatedAt: prev.portalAccess?.accountCreatedAt || new Date().toISOString(),
        authMethod: 'Password',
        customPassword: pass,
        mustChangePassword: prev.portalAccess?.mustChangePassword ?? true,
      },
    }));
  };

  // Quick Movement State inside Edit Modal
  const [newMovementForm, setNewMovementForm] = useState<{
    transferType: TransferType;
    employmentSource: EmploymentSource;
    previousDepartment: string;
    newDepartment: string;
    previousPosition: string;
    newPosition: string;
    effectiveDate: string;
    previousOrganisation: string;
    reason: string;
    approvingAuthority: string;
    referenceNumber: string;
  }>({
    transferType: 'Internal Transfer',
    employmentSource: 'Direct Recruitment',
    previousDepartment: editingEmployee.department || 'General Medicine',
    newDepartment: editingEmployee.department || 'General Medicine',
    previousPosition: editingEmployee.jobTitle || 'Medical Staff',
    newPosition: editingEmployee.jobTitle || 'Medical Staff',
    effectiveDate: new Date().toISOString().split('T')[0],
    previousOrganisation: 'Pope John Paul II Medical Centre',
    reason: 'Departmental reassignment & workload balancing',
    approvingAuthority: 'Human Resources Directorate / Medical Director',
    referenceNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = newPortalPassword.trim();
    const updatedEmployeeWithPassword: Employee = {
      ...editingEmployee,
      customPassword: cleanPassword ? cleanPassword : editingEmployee.customPassword,
      portalAccess: {
        ...editingEmployee.portalAccess,
        username: editingEmployee.portalAccess?.username || editingEmployee.email || editingEmployee.empCode,
        usernameType: editingEmployee.portalAccess?.usernameType || 'email',
        tempPassword: cleanPassword ? cleanPassword : (editingEmployee.portalAccess?.tempPassword || editingEmployee.empCode),
        passwordType: 'custom' as const,
        accountCreated: true,
        accountCreatedAt: editingEmployee.portalAccess?.accountCreatedAt || new Date().toISOString(),
        authMethod: 'Password' as const,
        customPassword: cleanPassword ? cleanPassword : editingEmployee.customPassword,
        mustChangePassword: editingEmployee.portalAccess?.mustChangePassword ?? true,
      },
    };
    onSave(updatedEmployeeWithPassword);
    setSaveSuccessMsg('Employee profile & official digital records saved successfully!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleAddMovementRecord = () => {
    const movementEntry = {
      id: `mov-${Date.now()}`,
      employeeId: editingEmployee.id,
      employeeName: `${editingEmployee.firstName} ${editingEmployee.lastName}`,
      employeeCode: editingEmployee.empCode,
      effectiveDate: newMovementForm.effectiveDate,
      transferType: newMovementForm.transferType,
      employmentSource: newMovementForm.employmentSource,
      previousDepartment: newMovementForm.previousDepartment,
      newDepartment: newMovementForm.newDepartment,
      previousPosition: newMovementForm.previousPosition,
      newPosition: newMovementForm.newPosition,
      previousOrganisation: newMovementForm.previousOrganisation,
      reason: newMovementForm.reason,
      approvingAuthority: newMovementForm.approvingAuthority,
      referenceNumber: newMovementForm.referenceNumber,
      status: 'Approved' as const,
      createdAt: new Date().toISOString(),
      verifiedByHr: true,
    };

    const updatedMovements = [movementEntry, ...(editingEmployee.movementHistory || [])];
    setEditingEmployee({
      ...editingEmployee,
      department: newMovementForm.newDepartment,
      jobTitle: newMovementForm.newPosition,
      employmentSource: newMovementForm.employmentSource,
      transferType: newMovementForm.transferType,
      previousDepartment: newMovementForm.previousDepartment,
      previousPosition: newMovementForm.previousPosition,
      previousOrganisation: newMovementForm.previousOrganisation,
      transferEffectiveDate: newMovementForm.effectiveDate,
      transferReferenceNumber: newMovementForm.referenceNumber,
      movementHistory: updatedMovements,
    });

    setSaveSuccessMsg(`New movement recorded! Transferred to ${newMovementForm.newDepartment}.`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-slate-950/90 border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setEditActiveTab('general')}
              className="group relative focus:outline-none"
              title="Click to update staff photo"
            >
              <img
                src={editingEmployee.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={editingEmployee.firstName}
                className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-md transition group-hover:opacity-80"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition">
                <Upload className="h-4 w-4 text-white" />
              </span>
              <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-900 ${
                editingEmployee.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Edit Staff Profile & Digital File
                </h3>
                <span className="font-mono text-[11px] bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-lg font-bold border border-slate-700">
                  {editingEmployee.empCode}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                  editingEmployee.gender === 'Female'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    : editingEmployee.gender === 'Male'
                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {editingEmployee.gender || 'Not Specified'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {editingEmployee.firstName} {editingEmployee.lastName} • {editingEmployee.jobTitle} ({editingEmployee.department})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Toast */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 pt-2 text-xs font-bold gap-1 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setEditActiveTab('general')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'general'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="h-4 w-4" /> Personal & Identification
          </button>

          <button
            type="button"
            onClick={() => setEditActiveTab('employment')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'employment'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="h-4 w-4 text-emerald-400" /> Position & Compensation
          </button>

          <button
            type="button"
            onClick={() => setEditActiveTab('documents')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'documents'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4 text-cyan-400" /> Official Letters & Vault
          </button>

          <button
            type="button"
            onClick={() => setEditActiveTab('movements')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'movements'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="h-4 w-4 text-indigo-400" /> Transfers & Career History
          </button>

          <button
            type="button"
            onClick={() => setEditActiveTab('licenses')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'licenses'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-4 w-4 text-amber-400" /> Medical Licenses & Certs
          </button>

          <button
            type="button"
            onClick={() => setEditActiveTab('education')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'education'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="h-4 w-4 text-purple-400" /> Education
          </button>

          <button
            type="button"
            onClick={() => setEditActiveTab('contacts')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'contacts'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="h-4 w-4 text-teal-400" /> Next of Kin & Contacts
          </button>

          <button
            type="button"
            onClick={() => setEditActiveTab('health')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'health'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartPulse className="h-4 w-4 text-rose-400" /> Health & Signature
          </button>

          <button
            type="button"
            onClick={() => setEditActiveTab('security')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              editActiveTab === 'security'
                ? 'border-amber-500 text-amber-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="h-4 w-4 text-amber-400" /> Portal Login & Password
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: PERSONAL & IDENTIFICATION */}
          {editActiveTab === 'general' && (
            <div className="space-y-5">
              {/* Employee Photo Upload & Management */}
              <EmployeePhotoUploader
                currentPhoto={editingEmployee.photo}
                employeeName={`${editingEmployee.firstName} ${editingEmployee.lastName}`}
                gender={editingEmployee.gender}
                onPhotoChange={(newPhoto) =>
                  setEditingEmployee({ ...editingEmployee, photo: newPhoto })
                }
                title="Employee Profile Photo"
                subtitle="Upload device photo (auto-compressed for cloud sync), live webcam/phone capture, or verified preset avatar"
              />

              {/* Names & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.firstName}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.lastName}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Staff Gender *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setEditingEmployee({ ...editingEmployee, gender: g })}
                        className={`py-2 rounded-xl font-bold text-xs transition border ${
                          editingEmployee.gender === g
                            ? g === 'Female'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address (Portal Username)</label>
                  <input
                    type="email"
                    required
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.phone}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingEmployee.dateOfBirth || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, dateOfBirth: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Identification Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Passport Number</label>
                  <input
                    type="text"
                    value={editingEmployee.passportNo || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, passportNo: e.target.value })}
                    placeholder="e.g. G1234567"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">National ID / General Identification</label>
                  <input
                    type="text"
                    value={editingEmployee.nationalId || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, nationalId: e.target.value })}
                    placeholder="e.g. GH-001239912"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Ghana Card Identification Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-amber-950/20 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-amber-200 text-xs">
                        Ghana Card Info (National Identification Authority - NIA)
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Ghana Card PIN registration & ID scan attachments
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">
                      Ghana Card PIN (e.g. GHA-712345678-9)
                    </label>
                    <input
                      type="text"
                      value={editingEmployee.ghanaCardPin || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, ghanaCardPin: e.target.value })}
                      placeholder="GHA-XXXXXXXXX-X"
                      className="w-full rounded-xl bg-slate-950 border border-amber-500/40 p-2.5 text-amber-200 focus:border-amber-400 focus:outline-none font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">
                      Ghana Card Expiry Date
                    </label>
                    <input
                      type="date"
                      value={editingEmployee.ghanaCardExpiry || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, ghanaCardExpiry: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-amber-500/40 p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POSITION & COMPENSATION */}
          {editActiveTab === 'employment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Staff Code / ID</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.empCode}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, empCode: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.jobTitle}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, jobTitle: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.department}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit / Section</label>
                  <input
                    type="text"
                    value={editingEmployee.unit || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, unit: e.target.value })}
                    placeholder="e.g. Pediatric ICU / Accounts"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Grade / Rank</label>
                  <input
                    type="text"
                    value={editingEmployee.gradeRank || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, gradeRank: e.target.value })}
                    placeholder="e.g. Senior Nursing Officer"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Type</label>
                  <select
                    value={editingEmployee.type}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, type: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Full-Time">Full-Time (Permanent)</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Locum">Locum</option>
                    <option value="Intern">Intern / National Service</option>
                  </select>
                </div>
              </div>

              {/* Financial & Compensation Details */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400" /> Payroll & Financial Records
                </h4>

                {/* Staff Grouping: Mechanised (Ghana Govt) vs Non-Mechanised (Hospital Paid) */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-amber-400" />
                      Staff Payroll Classification Group *
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Confidential Executive HR Metric
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingEmployee({ ...editingEmployee, mechanisationStatus: 'Mechanised' })}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                        (editingEmployee.mechanisationStatus || 'Mechanised') === 'Mechanised'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <span>🇬🇭</span> MECHANISED
                        </span>
                        {(editingEmployee.mechanisationStatus || 'Mechanised') === 'Mechanised' && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300">
                        Salary Paid by Ghana Government
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight">
                        CAGD mechanised subvention payroll (MoH / GHS clearance).
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingEmployee({ ...editingEmployee, mechanisationStatus: 'Non-Mechanised' })}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                        editingEmployee.mechanisationStatus === 'Non-Mechanised'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <span>🏥</span> NON-MECHANISED
                        </span>
                        {editingEmployee.mechanisationStatus === 'Non-Mechanised' && (
                          <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300">
                        Salary Paid by Hospital (IGF)
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight">
                        Direct monthly wage bill liability borne by hospital treasury.
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Monthly Basic Salary</label>
                    <input
                      type="number"
                      value={editingEmployee.salary || 0}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-emerald-400 focus:border-emerald-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Bank Account & Branch</label>
                    <input
                      type="text"
                      value={editingEmployee.bankAccount || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, bankAccount: e.target.value })}
                      placeholder="e.g. GCB Bank - 1029384849"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tax Identification Number (TIN)</label>
                    <input
                      type="text"
                      value={editingEmployee.taxId || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, taxId: e.target.value })}
                      placeholder="e.g. P0001234567"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Service & Appointment Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PJPIIMC Facility Join Date</label>
                  <input
                    type="date"
                    value={editingEmployee.joinDate || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, joinDate: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date of First Appointment</label>
                  <input
                    type="date"
                    value={editingEmployee.dateOfFirstAppointment || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, dateOfFirstAppointment: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Public Service Entry Date</label>
                  <input
                    type="date"
                    value={editingEmployee.publicServiceDate || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, publicServiceDate: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL HR LETTERS & VAULT */}
          {editActiveTab === 'documents' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-cyan-400" /> Mandatory Official Employment Records
                  </h4>
                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG Supported</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Appointment Letter */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">Appointment Letter</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        editingEmployee.appointmentLetterUrl ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {editingEmployee.appointmentLetterUrl ? 'Attached' : 'Missing'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = () => {
                            setEditingEmployee({
                              ...editingEmployee,
                              appointmentLetterUrl: reader.result as string,
                              appointmentLetterName: file.name,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-cyan-500"
                    />
                    {editingEmployee.appointmentLetterName && (
                      <p className="text-[10px] text-slate-300 truncate font-mono">
                        {editingEmployee.appointmentLetterName}
                      </p>
                    )}
                  </div>

                  {/* Assumption of Duty */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300">Assumption of Duty</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        editingEmployee.assumptionOfDutyUrl ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {editingEmployee.assumptionOfDutyUrl ? 'Attached' : 'Missing'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = () => {
                            setEditingEmployee({
                              ...editingEmployee,
                              assumptionOfDutyUrl: reader.result as string,
                              assumptionOfDutyName: file.name,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-emerald-500"
                    />
                    {editingEmployee.assumptionOfDutyName && (
                      <p className="text-[10px] text-slate-300 truncate font-mono">
                        {editingEmployee.assumptionOfDutyName}
                      </p>
                    )}
                  </div>

                  {/* Transfer Posting Document */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300">Transfer Letter</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        editingEmployee.transferDocumentUrl ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {editingEmployee.transferDocumentUrl ? 'Attached' : 'Optional'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = () => {
                            setEditingEmployee({
                              ...editingEmployee,
                              transferDocumentUrl: reader.result as string,
                              transferDocumentName: file.name,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:text-[10px] file:font-bold hover:file:bg-indigo-500"
                    />
                    {editingEmployee.transferDocumentName && (
                      <p className="text-[10px] text-slate-300 truncate font-mono">
                        {editingEmployee.transferDocumentName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSFERS & CAREER HISTORY */}
          {editActiveTab === 'movements' && (
            <div className="space-y-4">
              {/* Record Movement Form Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-3">
                <h4 className="font-bold text-indigo-300 text-xs flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-indigo-400" /> Record Departmental Transfer / Posting
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Transfer Type</label>
                    <select
                      value={newMovementForm.transferType}
                      onChange={(e) => setNewMovementForm({ ...newMovementForm, transferType: e.target.value as any })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200"
                    >
                      <option value="Internal Transfer">Internal Transfer (Inter-Department)</option>
                      <option value="External Transfer In">External Transfer In (From other facility)</option>
                      <option value="External Transfer Out">External Transfer Out</option>
                      <option value="Secondment">Secondment</option>
                      <option value="Promotion">Promotion with Reassignment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">New Assigned Department</label>
                    <input
                      type="text"
                      value={newMovementForm.newDepartment}
                      onChange={(e) => setNewMovementForm({ ...newMovementForm, newDepartment: e.target.value })}
                      placeholder="e.g. Surgical Ward / ICU"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">New Position / Job Title</label>
                    <input
                      type="text"
                      value={newMovementForm.newPosition}
                      onChange={(e) => setNewMovementForm({ ...newMovementForm, newPosition: e.target.value })}
                      placeholder="e.g. Senior Nursing Officer"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={newMovementForm.effectiveDate}
                      onChange={(e) => setNewMovementForm({ ...newMovementForm, effectiveDate: e.target.value })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Authorizing Body / Authority</label>
                    <input
                      type="text"
                      value={newMovementForm.approvingAuthority}
                      onChange={(e) => setNewMovementForm({ ...newMovementForm, approvingAuthority: e.target.value })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Reference Letter Number</label>
                    <input
                      type="text"
                      value={newMovementForm.referenceNumber}
                      onChange={(e) => setNewMovementForm({ ...newMovementForm, referenceNumber: e.target.value })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddMovementRecord}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> Commit Movement Entry
                  </button>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-300 text-xs">Historical Postings & Movements</h5>
                {(editingEmployee.movementHistory || []).length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 italic">
                    No previous transfer history on record. Initial appointment at {editingEmployee.department}.
                  </div>
                ) : (
                  (editingEmployee.movementHistory || []).map((m, idx) => (
                    <div key={m.id || idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{m.transferType}</span>
                          <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {m.referenceNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          {m.previousDepartment} ({m.previousPosition}) ➔ <strong className="text-emerald-400">{m.newDepartment} ({m.newPosition})</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Effective: {m.effectiveDate} • Authorized by: {m.approvingAuthority}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: MEDICAL LICENSES & CERTS */}
          {editActiveTab === 'licenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" /> Medical Council & Nursing Board Licenses
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const newLic: MedicalLicense = {
                      id: `lic-${Date.now()}`,
                      licenseType: 'MDC Ghana Practice License',
                      licenseNumber: `MDC-${Math.floor(10000 + Math.random() * 90000)}`,
                      issuingAuthority: 'Medical & Dental Council Ghana',
                      issueDate: new Date().toISOString().split('T')[0],
                      expiryDate: `${new Date().getFullYear() + 1}-12-31`,
                      status: 'Active',
                      verified: true,
                    };
                    setEditingEmployee({
                      ...editingEmployee,
                      medicalLicenses: [...(editingEmployee.medicalLicenses || []), newLic],
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Medical License
                </button>
              </div>

              {(editingEmployee.medicalLicenses || []).length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 italic">
                  No medical council licenses registered. Click "Add Medical License" to register PIN.
                </div>
              ) : (
                (editingEmployee.medicalLicenses || []).map((lic, idx) => (
                  <div key={lic.id || idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">License Type</label>
                        <input
                          type="text"
                          value={lic.licenseType}
                          onChange={(e) => {
                            const updated = [...(editingEmployee.medicalLicenses || [])];
                            updated[idx].licenseType = e.target.value;
                            setEditingEmployee({ ...editingEmployee, medicalLicenses: updated });
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">License PIN / Number</label>
                        <input
                          type="text"
                          value={lic.licenseNumber}
                          onChange={(e) => {
                            const updated = [...(editingEmployee.medicalLicenses || [])];
                            updated[idx].licenseNumber = e.target.value;
                            setEditingEmployee({ ...editingEmployee, medicalLicenses: updated });
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-amber-300 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Status</label>
                        <select
                          value={lic.status}
                          onChange={(e) => {
                            const updated = [...(editingEmployee.medicalLicenses || [])];
                            updated[idx].status = e.target.value as any;
                            setEditingEmployee({ ...editingEmployee, medicalLicenses: updated });
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200"
                        >
                          <option value="Active">Active / Compliant</option>
                          <option value="Expired">Expired</option>
                          <option value="Pending Renewal">Pending Renewal</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Issuing Board / Authority</label>
                        <input
                          type="text"
                          value={lic.issuingAuthority}
                          onChange={(e) => {
                            const updated = [...(editingEmployee.medicalLicenses || [])];
                            updated[idx].issuingAuthority = e.target.value;
                            setEditingEmployee({ ...editingEmployee, medicalLicenses: updated });
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={lic.expiryDate}
                          onChange={(e) => {
                            const updated = [...(editingEmployee.medicalLicenses || [])];
                            updated[idx].expiryDate = e.target.value;
                            setEditingEmployee({ ...editingEmployee, medicalLicenses: updated });
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: EDUCATION & QUALIFICATIONS */}
          {editActiveTab === 'education' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Highest Academic Qualification</label>
                <input
                  type="text"
                  value={editingEmployee.education || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, education: e.target.value })}
                  placeholder="e.g. MB ChB, FWACS / BSc Nursing"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Graduating University / Institution</label>
                <input
                  type="text"
                  value={editingEmployee.institution || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, institution: e.target.value })}
                  placeholder="e.g. KNUST School of Medical Sciences / Univ of Ghana"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Graduation Year</label>
                <input
                  type="text"
                  value={editingEmployee.graduationYear || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, graduationYear: e.target.value })}
                  placeholder="e.g. 2018"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 7: NEXT OF KIN & EMERGENCY CONTACTS */}
          {editActiveTab === 'contacts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-400" /> Primary Emergency Contact / Next of Kin
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editingEmployee.emergencyContactName || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, emergencyContactName: e.target.value })}
                      placeholder="e.g. Mary Mensah"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Relationship</label>
                    <input
                      type="text"
                      value={editingEmployee.emergencyContactRelation || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, emergencyContactRelation: e.target.value })}
                      placeholder="e.g. Spouse / Brother"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Emergency Phone Number</label>
                    <input
                      type="tel"
                      value={editingEmployee.emergencyContactPhone || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, emergencyContactPhone: e.target.value })}
                      placeholder="+233 24 000 0000"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: HEALTH & SIGNATURE */}
          {editActiveTab === 'health' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">Occupational Health & Fitness Status</h4>
                    <p className="text-[10px] text-slate-400">Clinical fitness to practice & medical clearances</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                    editingEmployee.fitForDuty ?? true
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {(editingEmployee.fitForDuty ?? true) ? 'Fit for Clinical Duty' : 'Medical Restriction'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Last Health Assessment Date</label>
                    <input
                      type="date"
                      value={editingEmployee.lastHealthCheckDate || ''}
                      onChange={(e) => setEditingEmployee({ ...editingEmployee, lastHealthCheckDate: e.target.value })}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Duty Status Toggle</label>
                    <button
                      type="button"
                      onClick={() => setEditingEmployee({
                        ...editingEmployee,
                        fitForDuty: !(editingEmployee.fitForDuty ?? true),
                      })}
                      className={`w-full py-2 rounded-xl font-bold text-xs transition border ${
                        (editingEmployee.fitForDuty ?? true)
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-rose-600 text-white border-rose-500'
                      }`}
                    >
                      {(editingEmployee.fitForDuty ?? true) ? 'Mark Restricted' : 'Mark Fit for Duty'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: PORTAL LOGIN & PASSWORD SECURITY */}
          {editActiveTab === 'security' && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-slate-950 p-4 sm:p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">Staff Portal Account & Password</h4>
                      <p className="text-[11px] text-slate-400">
                        Manage employee self-service login credentials, reset passwords, and enforce security policies
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Generate Strong Password
                  </button>
                </div>

                {/* Account Status and Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Portal Username (Login ID)</span>
                    <p className="font-mono text-emerald-400 font-bold text-sm">
                      {editingEmployee.portalAccess?.username || editingEmployee.email || editingEmployee.empCode}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Format: {editingEmployee.portalAccess?.usernameType === 'empCode' ? 'Staff Code' : 'Work Email'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Provisioning Status</span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        {editingEmployee.portalAccess?.accountCreated ? 'Active & Configured' : 'Ready to Provision'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Auth Method: Password Authentication
                    </span>
                  </div>
                </div>

                {/* Password Setting Input */}
                <div className="space-y-2 pt-2">
                  <label className="block text-slate-200 font-bold text-xs">
                    Staff Portal Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPortalPassword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewPortalPassword(val);
                        setEditingEmployee((prev) => ({
                          ...prev,
                          customPassword: val,
                        }));
                      }}
                      placeholder="Enter new portal password"
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-500 focus:border-amber-500 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    HR can type any custom password or use the quick reset buttons below. Saving the employee profile will immediately activate this password.
                  </p>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPortalPassword(editingEmployee.empCode);
                        setShowPassword(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Lock className="h-3 w-3 text-emerald-400" /> Reset to Staff Code ({editingEmployee.empCode})
                    </button>

                    {editingEmployee.email && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewPortalPassword(editingEmployee.email);
                          setShowPassword(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500/50 text-slate-300 text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <Lock className="h-3 w-3 text-indigo-400" /> Reset to Email
                      </button>
                    )}
                  </div>
                </div>

                {/* Password Policy Toggle */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={editingEmployee.portalAccess?.mustChangePassword ?? true}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditingEmployee((prev) => ({
                          ...prev,
                          portalAccess: {
                            ...prev.portalAccess,
                            mustChangePassword: checked,
                          },
                        }));
                      }}
                      className="rounded bg-slate-900 border-slate-700 text-amber-500"
                    />
                    <span>Require staff member to change password upon their next login</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              {onDelete && (
                <button
                  type="button"
                  id="btn-edit-modal-delete-staff"
                  onClick={() => {
                    onClose();
                    onDelete(editingEmployee);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition flex items-center gap-1.5"
                  title="Delete this employee record permanently"
                >
                  <Trash2 className="h-4 w-4" /> Delete Staff Member
                </button>
              )}
              <span className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                HR Audit Trail Enabled
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-edit-employee"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 text-xs"
              >
                <Save className="h-4 w-4" /> Save Employee File Updates
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
