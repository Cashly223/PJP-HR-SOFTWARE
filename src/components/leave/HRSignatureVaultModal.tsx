import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Upload,
  PenTool,
  CheckCircle2,
  X,
  FileText,
  Building2,
  Sparkles,
  RefreshCw,
  Search,
  UserCheck,
  AlertTriangle,
  Lock,
  Crown,
  Award,
  Users,
} from 'lucide-react';
import { Employee } from '../../types/hrms';
import { useHrms } from '../../context/HrmsContext';

interface HRSignatureVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployee?: Employee | null;
}

export const HRSignatureVaultModal: React.FC<HRSignatureVaultModalProps> = ({
  isOpen,
  onClose,
  targetEmployee,
}) => {
  const { employees, departmentLeadership, uploadEmployeeDigitalSignature, activeRole, currentUser } = useHrms();
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    targetEmployee?.id || employees[0]?.id || ''
  );
  const [roleFilter, setRoleFilter] = useState<'approvers' | 'hou' | 'hod' | 'hr' | 'ceo' | 'all'>('approvers');
  const [signatureMode, setSignatureMode] = useState<'upload' | 'draw' | 'generate'>('upload');
  const [previewSignatureUrl, setPreviewSignatureUrl] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isHRAuthorized =
    activeRole === 'super_admin' ||
    activeRole === 'hr_director' ||
    activeRole === 'hr_manager' ||
    activeRole === 'facility_head';

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || targetEmployee || employees[0];

  // Helper to identify approver tier for an employee
  const getEmployeeLeadershipInfo = (emp: Employee) => {
    // Check Facility Head (Tier 4)
    const isFacilityHead =
      emp.role === 'facility_head' ||
      departmentLeadership.some((d) => d.facilityHeadId === emp.id);

    // Check HR Directorate (Tier 3)
    const isHR =
      emp.role === 'hr_director' ||
      emp.role === 'hr_manager' ||
      emp.role === 'super_admin' ||
      emp.jobTitle?.toLowerCase().includes('hr ') ||
      emp.jobTitle?.toLowerCase().includes('human resource') ||
      emp.department?.toLowerCase().includes('human resource');

    // Check Dept Head (Tier 2)
    const deptHeadRecord = departmentLeadership.find((d) => d.departmentHeadId === emp.id);
    const isDeptHead = emp.role === 'dept_head' || !!deptHeadRecord;

    // Check Unit Head (Tier 1)
    const unitHeadRecord = departmentLeadership
      .flatMap((d) => d.units.map((u) => ({ ...u, deptName: d.departmentName })))
      .find((u) => u.unitHeadId === emp.id);
    const isUnitHead = emp.role === 'unit_head' || !!unitHeadRecord;

    if (isFacilityHead) {
      return {
        tier: 4,
        tierLabel: 'Tier 4: Facility In-Charge',
        roleTitle: 'Chief Medical Officer / CEO',
        badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        isApprover: true,
      };
    }
    if (isHR) {
      return {
        tier: 3,
        tierLabel: 'Tier 3: HR Directorate',
        roleTitle: emp.jobTitle || 'HR Manager',
        badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        isApprover: true,
      };
    }
    if (isDeptHead) {
      return {
        tier: 2,
        tierLabel: 'Tier 2: Department Head (HOD)',
        roleTitle: `Head of ${deptHeadRecord?.departmentName || emp.department}`,
        badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        isApprover: true,
      };
    }
    if (isUnitHead) {
      return {
        tier: 1,
        tierLabel: 'Tier 1: Unit Head (HOU)',
        roleTitle: `Head of ${unitHeadRecord?.unitName || emp.unit || 'Unit'}`,
        badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
        isApprover: true,
      };
    }

    return {
      tier: 0,
      tierLabel: 'Clinical / Administrative Staff',
      roleTitle: emp.jobTitle,
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300',
      isApprover: false,
    };
  };

  // Helper to generate stylized SVG signature data URL
  const generateScriptSignature = (fullName: string, roleTitle: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 450, 140);

    // Draw light decorative grid/lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(430, 100);
    ctx.stroke();

    // Draw cursive stylized signature text
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic bold 32px "Brush Script MT", "Segoe Script", "Great Vibes", cursive, sans-serif';
    ctx.fillText(fullName, 30, 75);

    // Add security seal text & metadata
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 9px "Segoe UI", sans-serif';
    ctx.fillText(`✓ CHST HR VERIFIED DIGITAL SIGNATURE • ${new Date().toLocaleDateString()}`, 30, 118);

    ctx.fillStyle = '#64748b';
    ctx.font = '8px "Segoe UI", sans-serif';
    ctx.fillText(`AUTH: HR DIRECTORATE • ID: ${selectedEmp?.empCode || 'PJ-AUTH'}`, 30, 130);

    return canvas.toDataURL('image/png');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewSignatureUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setPreviewSignatureUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPreviewSignatureUrl('');
  };

  const handleGenerateScript = () => {
    if (!selectedEmp) return;
    const name = `${selectedEmp.firstName} ${selectedEmp.lastName}`;
    const generated = generateScriptSignature(name, selectedEmp.jobTitle);
    setPreviewSignatureUrl(generated);
  };

  const handleSaveSignature = async () => {
    if (!selectedEmpId || !previewSignatureUrl) return;
    const uploadedBy = `${currentUser?.name || 'Miss Vero'} (HR Directorate)`;
    await uploadEmployeeDigitalSignature(selectedEmpId, previewSignatureUrl, uploadedBy);
    onClose();
  };

  if (!isOpen) return null;

  const filteredEmployees = (employees || []).filter((emp) => {
    if (!emp) return false;
    const q = searchTerm.toLowerCase();
    const info = getEmployeeLeadershipInfo(emp);

    const matchesSearch =
      (emp.firstName || '').toLowerCase().includes(q) ||
      (emp.lastName || '').toLowerCase().includes(q) ||
      (emp.department || '').toLowerCase().includes(q) ||
      (emp.empCode || '').toLowerCase().includes(q) ||
      (emp.jobTitle || '').toLowerCase().includes(q) ||
      (info.tierLabel || '').toLowerCase().includes(q) ||
      (info.roleTitle || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (roleFilter === 'approvers') return info.isApprover;
    if (roleFilter === 'hou') return info.tier === 1;
    if (roleFilter === 'hod') return info.tier === 2;
    if (roleFilter === 'hr') return info.tier === 3;
    if (roleFilter === 'ceo') return info.tier === 4;
    return true; // 'all'
  });

  const selectedEmpInfo = selectedEmp ? getEmployeeLeadershipInfo(selectedEmp) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Building2 className="h-3 w-3" /> CATHOLIC HEALTH SERVICE TRUST (CHST)
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              Four-Tier Approvers & Leadership Digital Signatures Vault
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In accordance with CHST directives, HR uploads and certifies official digital signatures for appointed Departmental Heads, Unit Heads, HR Leadership, and Facility Executives for multi-tier leave approval sign-offs.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Security Alert Badge */}
        <div className="mb-5 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-3">
          <Crown className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <strong className="font-bold">HR Leadership Assignment Protocol:</strong> Only designated Four-Tier Approvers and Departmental Heads sign leave documents. HR uploads and validates signatures during leadership appointments (HOD, HOU, HR Manager, and CEO/CMO).
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Select Employee */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                1. Select Approver / Head
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                {filteredEmployees.length} Found
              </span>
            </div>

            {/* Quick Role Filter Pills */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setRoleFilter('approvers')}
                className={`px-2 py-1 rounded-lg transition ${
                  roleFilter === 'approvers'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Approver Heads
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('hou')}
                className={`px-2 py-1 rounded-lg transition ${
                  roleFilter === 'hou'
                    ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tier 1 (HOU)
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('hod')}
                className={`px-2 py-1 rounded-lg transition ${
                  roleFilter === 'hod'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tier 2 (HOD)
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('hr')}
                className={`px-2 py-1 rounded-lg transition ${
                  roleFilter === 'hr'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tier 3 (HR)
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('ceo')}
                className={`px-2 py-1 rounded-lg transition ${
                  roleFilter === 'ceo'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tier 4 (CEO)
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-2 py-1 rounded-lg transition ${
                  roleFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All Staff
              </button>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search head name, code, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-medium"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50 dark:bg-slate-800/40">
              {filteredEmployees.map((emp) => {
                const isSelected = emp.id === selectedEmpId;
                const hasSignature = !!emp.digitalSignatureUrl;
                const empInfo = getEmployeeLeadershipInfo(emp);

                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      setSelectedEmpId(emp.id);
                      if (emp.digitalSignatureUrl) {
                        setPreviewSignatureUrl(emp.digitalSignatureUrl);
                      } else {
                        setPreviewSignatureUrl('');
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow font-bold'
                        : 'hover:bg-slate-200/80 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold truncate">
                          {emp.firstName} {emp.lastName}
                        </span>
                        {empInfo.isApprover && (
                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${
                            isSelected ? 'bg-white/20 text-white border-white/40' : empInfo.badgeColor
                          }`}>
                            T{empInfo.tier}
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {empInfo.roleTitle}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {hasSignature ? (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'}`}>
                          On File
                        </span>
                      ) : (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium uppercase ${isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'}`}>
                          No Sig
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedEmp && selectedEmpInfo && (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedEmp.firstName} {selectedEmp.lastName}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {selectedEmp.empCode || 'STF-1001'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${selectedEmpInfo.badgeColor}`}>
                    {selectedEmpInfo.tierLabel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedEmpInfo.roleTitle} • {selectedEmp.department}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                  Signature Status: {selectedEmp.digitalSignatureUrl ? '✓ Official Signature Authorized on File' : '⚠️ No Signature on Record (Upload Below)'}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Upload / Draw / Generate Signature */}
          <div className="md:col-span-7 space-y-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Upload or Authorize Digital Signature
            </label>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSignatureMode('upload')}
                className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  signatureMode === 'upload'
                    ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignatureMode('draw');
                  clearCanvas();
                }}
                className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  signatureMode === 'draw'
                    ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <PenTool className="h-3.5 w-3.5" /> Draw Pad
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignatureMode('generate');
                  handleGenerateScript();
                }}
                className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  signatureMode === 'generate'
                    ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" /> Official Script
              </button>
            </div>

            {/* Mode 1: File Upload */}
            {signatureMode === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50/20"
                >
                  <Upload className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click or Drag to Upload Official Signature Image
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Supports PNG, JPG, or SVG scanned official signatures (transparent background recommended)
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Draw Pad */}
            {signatureMode === 'draw' && (
              <div className="space-y-2">
                <div className="relative border border-slate-300 dark:border-slate-700 rounded-2xl bg-white overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={420}
                    height={130}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[130px] cursor-crosshair touch-none"
                  />
                  <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 pointer-events-none font-mono">
                    Sign on line above using mouse, touch, or stylus
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs text-rose-500 hover:text-rose-600 font-bold px-3 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Clear Signature Pad
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Official Script Generator */}
            {signatureMode === 'generate' && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Generate Stylized CHST Script Signature
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateScript}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="h-3 w-3" /> Re-generate
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Generates an authorized digital pen rendering with CHST authentication stamp based on the selected officer's legal name.
                </p>
              </div>
            )}

            {/* Signature Preview & Verification Box */}
            {previewSignatureUrl && (
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Signature Authorization Preview
                  </span>
                  <span className="font-mono text-[9px] uppercase bg-emerald-200/60 dark:bg-emerald-800/50 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200">
                    CHST HR-VERIFIED
                  </span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center min-h-[90px]">
                  <img
                    src={previewSignatureUrl}
                    alt="Authorized Digital Signature"
                    className="max-h-20 max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                disabled={!previewSignatureUrl}
                className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow flex items-center gap-1.5 transition ${
                  previewSignatureUrl
                    ? 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
                    : 'bg-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Authorize & Save Signature in Vault
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
