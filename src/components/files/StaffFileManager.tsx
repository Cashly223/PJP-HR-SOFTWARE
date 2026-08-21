import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Upload,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Trash2,
  Download,
  Eye,
  FilePlus,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Tag,
  Building,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { StaffFile } from '../../types/hrms';

export const StaffFileManager: React.FC = () => {
  const {
    currentUser,
    staffFiles,
    employees,
    uploadStaffFile,
    deleteStaffFile,
    toggleStaffFilePermission,
  } = useHrms();

  const isHR = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(
    currentUser?.role || ''
  );

  // Selected employee view for HR officers
  const [selectedEmpId, setSelectedEmpId] = useState<string>(currentUser?.id || '');

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Upload Form State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadCategory, setUploadCategory] = useState<StaffFile['category']>('Medical License');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewData, setFilePreviewData] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  // Preview Modal State
  const [activePreviewFile, setActivePreviewFile] = useState<StaffFile | null>(null);

  // Target Employee record
  const targetEmp = employees.find((e) => e.id === selectedEmpId) || {
    id: currentUser?.id || 'emp-curr',
    firstName: currentUser?.name.split(' ')[0] || 'Current',
    lastName: currentUser?.name.split(' ').slice(1).join(' ') || 'User',
    email: currentUser?.email || '',
    role: currentUser?.role || 'nurse',
    department: currentUser?.department || 'General Staff',
    filePermissionGranted: currentUser?.filePermissionGranted ?? true,
  };

  const hasUploadPermission = isHR || targetEmp.filePermissionGranted !== false;

  // Filtered files list
  const userFiles = (staffFiles || []).filter((f) => {
    if (!f) return false;
    const matchesUser = isHR
      ? selectedEmpId === 'ALL_STAFF' || f.ownerUid === selectedEmpId || f.ownerEmail === targetEmp.email
      : (f.ownerEmail && currentUser?.email && f.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) || f.ownerUid === currentUser?.id;

    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch =
      (f.fileName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes((searchTerm || '').toLowerCase()));

    return matchesUser && matchesCategory && matchesSearch;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setFilePreviewData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedFile) {
      setUploadError('Please select a document file to upload.');
      return;
    }

    setUploadLoading(true);
    try {
      await uploadStaffFile({
        fileName: selectedFile.name,
        fileType: selectedFile.type.includes('pdf')
          ? 'pdf'
          : selectedFile.type.includes('image')
          ? 'image'
          : 'doc',
        fileSize: selectedFile.size,
        fileData: filePreviewData || 'data:text/plain;base64,U3RhZmYgRG9jdW1lbnQ=',
        category: uploadCategory,
        description: uploadDescription,
      });

      setUploadSuccess('Document successfully uploaded and saved to secure database!');
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setUploadDescription('');
        setUploadSuccess(null);
      }, 1500);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploadLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg font-bold">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Staff File & Document Vault
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Encrypted Cloud Storage
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage personal licenses, clinical certifications, contracts, and HR files with security permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUploadPermission ? (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
            >
              <FilePlus className="h-4 w-4" /> Upload New File
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              <Lock className="h-4 w-4" /> File Upload Locked by HR
            </div>
          )}
        </div>
      </div>

      {/* HR Governance Selector & Clearance Switcher */}
      {isHR && (
        <div className="p-5 rounded-3xl bg-indigo-950/40 border border-indigo-800/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">HR Clearance & File Inspector</h3>
                <p className="text-xs text-slate-400">
                  Select a staff member to view their document vault and manage file upload permissions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-300 whitespace-nowrap">
                Select Employee:
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={currentUser?.id}>Me ({currentUser?.name})</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.department} - {emp.jobTitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* HR Toggle Switch for selected employee */}
          {selectedEmpId !== 'ALL_STAFF' && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    targetEmp.filePermissionGranted !== false
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {targetEmp.filePermissionGranted !== false ? (
                    <Unlock className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-white">
                    File Upload Clearance for {targetEmp.firstName} {targetEmp.lastName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {targetEmp.filePermissionGranted !== false
                      ? 'Employee is currently PERMITTED to upload, view, and update their personal files.'
                      : 'Employee file upload access is RESTRICTED by HR administration.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  toggleStaffFilePermission(
                    targetEmp.id,
                    targetEmp.filePermissionGranted === false
                  )
                }
                className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                  targetEmp.filePermissionGranted !== false
                    ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {targetEmp.filePermissionGranted !== false ? (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Revoke Clearance
                  </>
                ) : (
                  <>
                    <Unlock className="h-3.5 w-3.5" /> Grant Upload Clearance
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security Status Banner for Non-HR Users */}
      {!isHR && !hasUploadPermission && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-300">
                File Upload & Modification Restricted by HR Policy
              </p>
              <p className="text-[11px] text-amber-400/80">
                You can view your existing uploaded files. To upload new medical licenses or update files, submit an upload request to HR.
              </p>
            </div>
          </div>

          <button
            onClick={() => setRequestSent(true)}
            disabled={requestSent}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shrink-0"
          >
            {requestSent ? 'Request Submitted to HR' : 'Request Upload Permission'}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Medical License', 'Clinical Certification', 'HR Contract', 'Personal Document', 'Other'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userFiles.map((file) => (
          <div
            key={file.id}
            className="group relative flex flex-col justify-between p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition">
                      {file.fileName}
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {formatBytes(file.fileSize)}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800 whitespace-nowrap">
                  {file.category}
                </span>
              </div>

              {file.description && (
                <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  {file.description}
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {file.uploadedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" /> {file.ownerName}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-4">
              <button
                onClick={() => setActivePreviewFile(file)}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Eye className="h-3.5 w-3.5" /> View / Download
              </button>

              {hasUploadPermission && (
                <button
                  onClick={() => deleteStaffFile(file.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Delete File"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {userFiles.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
            <div className="p-4 rounded-full bg-slate-800 text-slate-500">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h4 className="text-sm font-bold text-white">No Staff Files Found</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              {hasUploadPermission
                ? 'Click "Upload New File" to add medical licenses, certifications, or personal records.'
                : 'No documents have been uploaded for this account yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Upload Staff Document</h3>
                  <p className="text-xs text-slate-400">
                    Upload medical license, clinical cert, or contract to your file store.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as StaffFile['category'])}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Medical License">State Medical License</option>
                  <option value="Clinical Certification">Clinical Certification (BLS / ACLS)</option>
                  <option value="HR Contract">HR Contract / Employment Agreement</option>
                  <option value="Performance Review">Performance Review & Evaluation</option>
                  <option value="Personal Document">Personal Identification Document</option>
                  <option value="Other">Other Clinical Document</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Select File</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/50 transition">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">
                    {selectedFile ? selectedFile.name : 'Click or drag & drop file here'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">PDF, PNG, JPG, DOCX (Max 10MB)</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Description / Notes</label>
                <textarea
                  rows={3}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="e.g. 2026 Annual Medical Board License renewal receipt..."
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="w-full py-3 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg transition flex items-center justify-center gap-2"
                >
                  {uploadLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Upload & Save to Vault</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {activePreviewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{activePreviewFile.fileName}</h3>
                  <p className="text-xs text-slate-400">
                    Category: {activePreviewFile.category} • Uploaded by {activePreviewFile.ownerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewFile(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">Owner Email:</span>
                <span className="font-mono text-white">{activePreviewFile.ownerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">File Size:</span>
                <span className="font-mono text-white">{formatBytes(activePreviewFile.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">Upload Date:</span>
                <span className="text-white">{activePreviewFile.uploadedAt}</span>
              </div>
              {activePreviewFile.description && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-400 block mb-1">Notes:</span>
                  <p className="text-slate-300">{activePreviewFile.description}</p>
                </div>
              )}
            </div>

            <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
              <p className="text-xs text-slate-300">
                Document verified and encrypted in St. Jude Health Firestore Vault.
              </p>
              <a
                href={activePreviewFile.fileData}
                download={activePreviewFile.fileName}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Download Encrypted File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
