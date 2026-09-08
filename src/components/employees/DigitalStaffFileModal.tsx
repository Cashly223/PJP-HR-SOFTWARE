import React, { useState } from 'react';
import {
  X,
  Pencil,
  FileText,
  Key,
  Award,
  Lock,
  ShieldCheck,
  FileCheck,
  Upload,
  Download,
  Eye,
  Trash2,
  Phone,
  Send,
  Building2,
  Calendar,
  CreditCard,
  Briefcase,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  User,
  Camera,
} from 'lucide-react';
import { Employee, StaffFile, OfficialDocument } from '../../types/hrms';
import { EmployeePhotoModal } from '../common/EmployeePhotoModal';

interface DigitalStaffFileModalProps {
  employee: Employee;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
  onDelete?: (emp: Employee) => void;
  staffFiles: StaffFile[];
  toggleStaffFilePermission: (empId: string, granted: boolean) => Promise<void>;
  deleteStaffFile: (fileId: string) => Promise<void>;
  handleTriggerSendInvite: (empId: string) => void;
  handleTriggerSendSmsInvite: (empId: string) => void;
  formatCurrency: (amount: number) => string;
  onUpdateEmployee: (emp: Employee) => void;
  onOpenChangePassword?: (emp: Employee) => void;
}

export const DigitalStaffFileModal: React.FC<DigitalStaffFileModalProps> = ({
  employee,
  onClose,
  onEdit,
  onDelete,
  staffFiles,
  toggleStaffFilePermission,
  deleteStaffFile,
  handleTriggerSendInvite,
  handleTriggerSendSmsInvite,
  formatCurrency,
  onUpdateEmployee,
  onOpenChangePassword,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(employee);
  const [digitalFileActiveTab, setDigitalFileActiveTab] = useState<'documents' | 'overview' | 'licenses' | 'timeline'>('documents');
  const [uploadCategory, setUploadCategory] = useState<OfficialDocument['type']>('General HR Document');
  const [uploadDocTitle, setUploadDocTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const empStaffFiles = (staffFiles || []).filter(
    (f) =>
      f.ownerEmail === selectedEmployee.email ||
      f.ownerUid === selectedEmployee.id ||
      f.ownerName.toLowerCase().includes(selectedEmployee.firstName.toLowerCase())
  );

  const totalDocsCount =
    (selectedEmployee.officialDocuments || []).length +
    empStaffFiles.length +
    (selectedEmployee.appointmentLetterUrl ? 1 : 0) +
    (selectedEmployee.assumptionOfDutyUrl ? 1 : 0) +
    (selectedEmployee.transferDocumentUrl ? 1 : 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: OfficialDocument['type']) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const fileUrl = reader.result as string;
        const newDoc: OfficialDocument = {
          id: `doc-${Date.now()}`,
          title: uploadDocTitle || file.name.replace(/\.[^/.]+$/, ''),
          type: docType,
          fileUrl: fileUrl,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'HR Officer',
        };

        let updated = { ...selectedEmployee };
        if (docType === 'Appointment Letter') {
          updated.appointmentLetterUrl = fileUrl;
          updated.appointmentLetterName = file.name;
        } else if (docType === 'Assumption of Duty Letter') {
          updated.assumptionOfDutyUrl = fileUrl;
          updated.assumptionOfDutyName = file.name;
        } else if (docType === 'Transfer Document') {
          updated.transferDocumentUrl = fileUrl;
          updated.transferDocumentName = file.name;
        } else {
          updated.officialDocuments = [newDoc, ...(updated.officialDocuments || [])];
        }

        setSelectedEmployee(updated);
        onUpdateEmployee(updated);
        setUploadDocTitle('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 p-6 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="group relative focus:outline-none shrink-0"
                title="Click to update staff photo"
              >
                <img
                  src={selectedEmployee.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedEmployee.firstName}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md transition group-hover:opacity-75"
                />
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition">
                  <Camera className="h-5 w-5 text-emerald-400" />
                </span>
                <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${
                  selectedEmployee.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <span className="font-mono text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg font-bold">
                    {selectedEmployee.empCode}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                    selectedEmployee.gender === 'Female'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      : selectedEmployee.gender === 'Male'
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {selectedEmployee.gender || 'Not Specified'}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700">
                    {selectedEmployee.type || 'Full-Time'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-400 mt-1">
                  {selectedEmployee.jobTitle} • {selectedEmployee.department}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hospital ID: <span className="font-mono text-slate-300">{selectedEmployee.hospitalId || 'PJPIIMC-MAIN'}</span> • Joined: {selectedEmployee.joinDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                title="Update Staff Profile Photo"
              >
                <Camera className="h-4 w-4 text-emerald-400" /> Photo
              </button>
              {onDelete && (
                <button
                  type="button"
                  id="btn-modal-delete-staff-file"
                  onClick={() => {
                    onClose();
                    onDelete(selectedEmployee);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition flex items-center gap-1.5"
                  title="Delete Staff Member from System"
                >
                  <Trash2 className="h-4 w-4" /> Delete Staff
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(selectedEmployee);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" /> Edit Details & Files
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Digital File Inner Segmented Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-950/60 px-6 pt-2 text-xs font-bold overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setDigitalFileActiveTab('documents')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-2 transition ${
              digitalFileActiveTab === 'documents'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-t-lg'
            }`}
          >
            <FileText className="h-4 w-4 text-cyan-400" /> Digital File Vault & HR Letters
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300 font-extrabold border border-cyan-500/30">
              {totalDocsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDigitalFileActiveTab('overview')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-2 transition ${
              digitalFileActiveTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-t-lg'
            }`}
          >
            <Key className="h-4 w-4 text-indigo-400" /> Credentials & Employment Profile
          </button>

          <button
            type="button"
            onClick={() => setDigitalFileActiveTab('licenses')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-2 transition ${
              digitalFileActiveTab === 'licenses'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-t-lg'
            }`}
          >
            <Award className="h-4 w-4 text-amber-400" /> Medical Licenses & Health
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-amber-300">
              {(selectedEmployee.medicalLicenses || []).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDigitalFileActiveTab('timeline')}
            className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-2 transition ${
              digitalFileActiveTab === 'timeline'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-t-lg'
            }`}
          >
            <GitCommit className="h-4 w-4 text-purple-400" /> Transfers & Career Timeline
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: DIGITAL FILE VAULT & HR DOCUMENTS */}
          {digitalFileActiveTab === 'documents' && (
            <div className="space-y-5">
              {/* Vault Permission Toggle */}
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-sm">Staff File Vault Access Permission</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Controls whether {selectedEmployee.firstName} can access and view their digital document vault in the mobile staff self-service portal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentGranted = selectedEmployee.filePermissionGranted ?? true;
                    toggleStaffFilePermission(selectedEmployee.id, !currentGranted);
                    const updated = {
                      ...selectedEmployee,
                      filePermissionGranted: !currentGranted,
                    };
                    setSelectedEmployee(updated);
                    onUpdateEmployee(updated);
                  }}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 border ${
                    (selectedEmployee.filePermissionGranted ?? true)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {(selectedEmployee.filePermissionGranted ?? true) ? 'Access Granted (Click to Revoke)' : 'Access Restricted (Click to Grant)'}
                </button>
              </div>

              {/* Mandatory Employment Letters */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-cyan-400" /> Mandatory Official Employment Records
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Appointment Letter */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-cyan-300 text-xs">Appointment Letter</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          selectedEmployee.appointmentLetterUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {selectedEmployee.appointmentLetterUrl ? 'Attached' : 'Missing'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Formal facility employment terms</p>
                      <p className="text-[10px] font-mono text-slate-300 mt-2 truncate">
                        {selectedEmployee.appointmentLetterName || 'No document on file'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <label className="cursor-pointer flex-1 py-1.5 px-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] text-center transition flex items-center justify-center gap-1">
                        <Upload className="h-3 w-3" /> Upload / Replace
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={(e) => handleFileUpload(e, 'Appointment Letter')}
                          className="hidden"
                        />
                      </label>
                      {selectedEmployee.appointmentLetterUrl && (
                        <a
                          href={selectedEmployee.appointmentLetterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition"
                          title="View Document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Assumption of Duty */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-300 text-xs">Assumption of Duty</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          selectedEmployee.assumptionOfDutyUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {selectedEmployee.assumptionOfDutyUrl ? 'Attached' : 'Missing'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Official reporting to clinical station</p>
                      <p className="text-[10px] font-mono text-slate-300 mt-2 truncate">
                        {selectedEmployee.assumptionOfDutyName || 'No document on file'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <label className="cursor-pointer flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] text-center transition flex items-center justify-center gap-1">
                        <Upload className="h-3 w-3" /> Upload / Replace
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={(e) => handleFileUpload(e, 'Assumption of Duty Letter')}
                          className="hidden"
                        />
                      </label>
                      {selectedEmployee.assumptionOfDutyUrl && (
                        <a
                          href={selectedEmployee.assumptionOfDutyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 transition"
                          title="View Document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Transfer Letter */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-indigo-300 text-xs">Transfer / Posting Letter</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          selectedEmployee.transferDocumentUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {selectedEmployee.transferDocumentUrl ? 'Attached' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Inter-facility or internal transfer order</p>
                      <p className="text-[10px] font-mono text-slate-300 mt-2 truncate">
                        {selectedEmployee.transferDocumentName || 'No transfer letter on file'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <label className="cursor-pointer flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] text-center transition flex items-center justify-center gap-1">
                        <Upload className="h-3 w-3" /> Upload / Replace
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={(e) => handleFileUpload(e, 'Transfer Document')}
                          className="hidden"
                        />
                      </label>
                      {selectedEmployee.transferDocumentUrl && (
                        <a
                          href={selectedEmployee.transferDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition"
                          title="View Document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* General Staff Documents Vault */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400" /> Archived Digital Records & Certificates
                  </h4>
                </div>

                {(selectedEmployee.officialDocuments || []).length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 italic">
                    No general documents uploaded. Use the Edit modal or uploader above to add files.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(selectedEmployee.officialDocuments || []).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-2xl bg-slate-950 p-3 border border-slate-800 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-900 text-emerald-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{doc.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {doc.type} • Uploaded {doc.uploadedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 transition"
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW & CREDENTIALS */}
          {digitalFileActiveTab === 'overview' && (
            <div className="space-y-5">
              {/* Portal Access Credentials Card */}
              <div className="rounded-2xl bg-indigo-950/30 p-4 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                    <Key className="h-4 w-4 text-indigo-400" /> Mobile Staff Portal Login Account
                  </h4>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    {selectedEmployee.portalAccess?.inviteStatus || 'Invitation Sent'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">PORTAL USERNAME</span>
                    <p className="font-mono text-emerald-400 font-bold text-xs mt-0.5">
                      {selectedEmployee.portalAccess?.username || selectedEmployee.email}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">PORTAL PASSWORD</span>
                      <p className="font-mono text-xs mt-0.5 font-bold">
                        {selectedEmployee.customPassword || selectedEmployee.portalAccess?.customPassword ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5" /> Personal Password Set (Default Overridden)
                          </span>
                        ) : (
                          <span className="text-amber-300">
                            {selectedEmployee.portalAccess?.tempPassword || selectedEmployee.empCode}
                          </span>
                        )}
                      </p>
                    </div>
                    {onOpenChangePassword && (
                      <button
                        type="button"
                        onClick={() => onOpenChangePassword(selectedEmployee)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition"
                        title="Set or Change Staff Portal Password"
                      >
                        <Key className="h-3.5 w-3.5" /> Change
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">
                    Supports Auth: SMS OTP / Staff ID / Work Email
                  </span>
                  <div className="flex items-center gap-2">
                    {onOpenChangePassword && (
                      <button
                        type="button"
                        onClick={() => onOpenChangePassword(selectedEmployee)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 transition flex items-center gap-1.5 shadow"
                      >
                        <Key className="h-3.5 w-3.5" /> Set / Change Password
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleTriggerSendSmsInvite(selectedEmployee.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5" /> Send Credentials via SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerSendInvite(selectedEmployee.id)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition flex items-center gap-1.5"
                    >
                      <Send className="h-3.5 w-3.5" /> Resend Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal, Gender & Financial Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-300">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Gender & Biological Sex</span>
                  <p className="font-semibold text-white mt-0.5">{selectedEmployee.gender || 'Not Specified'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">National ID / Passport</span>
                  <p className="font-semibold text-white mt-0.5">{selectedEmployee.passportNo || '—'} / {selectedEmployee.nationalId || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Bank & Tax Identification</span>
                  <p className="font-semibold text-white mt-0.5">{selectedEmployee.bankAccount || '—'} (TIN: {selectedEmployee.taxId || '—'})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Base Salary</span>
                  <p className="font-semibold text-emerald-400 mt-0.5">
                    {formatCurrency(selectedEmployee.salary)} / mo
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Highest Qualification</span>
                  <p className="font-semibold text-white mt-0.5">{selectedEmployee.education || 'Degree / Diploma'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Ghana Card (NIA PIN)</span>
                  <p className="font-semibold text-amber-300 mt-0.5 font-mono">{selectedEmployee.ghanaCardPin || 'GHA-XXXXXXXXX-X'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LICENSES & HEALTH COMPLIANCE */}
          {digitalFileActiveTab === 'licenses' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-300 mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-400" /> Hospital Medical Licenses & Certifications
                </h4>
                <div className="space-y-2">
                  {(selectedEmployee.medicalLicenses || []).length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs italic text-center">
                      No medical license records registered.
                    </div>
                  ) : (
                    (selectedEmployee.medicalLicenses || []).map((lic) => (
                      <div
                        key={lic.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-3.5"
                      >
                        <div>
                          <span className="font-bold text-white block">{lic.licenseType}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            License No: <strong className="text-amber-300 font-mono">{lic.licenseNumber}</strong> • Issuing Board: {lic.issuingAuthority}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                              lic.status === 'Active'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {lic.status} (Expires: {lic.expiryDate})
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Occupational Health */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-300 mb-2">
                  Occupational Health Fitness Status
                </h4>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Clinical Duty Clearance</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Last evaluation: {selectedEmployee.lastHealthCheckDate || 'Compliant with clinical protocol'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    selectedEmployee.fitForDuty ?? true
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {(selectedEmployee.fitForDuty ?? true) ? 'Fit for Clinical Duty' : 'Duty Restricted'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAREER & MOVEMENT TIMELINE */}
          {digitalFileActiveTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-purple-400" /> Postings, Promotions & Transfer Log
              </h4>

              {(selectedEmployee.movementHistory || []).length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 italic">
                  Initial posting at {selectedEmployee.department}. No subsequent inter-departmental transfers recorded.
                </div>
              ) : (
                <div className="space-y-2">
                  {(selectedEmployee.movementHistory || []).map((m, idx) => (
                    <div key={m.id || idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{m.transferType}</span>
                        <span className="font-mono text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {m.referenceNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {m.previousDepartment} ({m.previousPosition}) ➔ <strong className="text-emerald-400">{m.newDepartment} ({m.newPosition})</strong>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Effective Date: {m.effectiveDate} • Authority: {m.approvingAuthority}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Employee Photo Upload Modal */}
      {isPhotoModalOpen && (
        <EmployeePhotoModal
          isOpen={isPhotoModalOpen}
          employee={selectedEmployee}
          onClose={() => setIsPhotoModalOpen(false)}
          onSavePhoto={(newPhoto) => {
            const updated = { ...selectedEmployee, photo: newPhoto };
            setSelectedEmployee(updated);
            onUpdateEmployee(updated);
          }}
        />
      )}
    </div>
  );
};
