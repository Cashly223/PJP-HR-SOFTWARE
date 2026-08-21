import React, { useState } from 'react';
import {
  Building2,
  UserCheck,
  Crown,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Mail,
  Award,
  FolderPlus,
  Trash2,
  PenTool,
  Upload,
  FileCheck,
  Lock,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee } from '../../types/hrms';
import { HRSignatureVaultModal } from '../leave/HRSignatureVaultModal';

export const DepartmentLeadershipManager: React.FC = () => {
  const {
    employees,
    departmentLeadership,
    assignDepartmentHead,
    assignUnitHead,
    addUnitToDepartment,
    addDepartment,
    setFacilityHead,
    uploadEmployeeDigitalSignature,
    activeRole,
    currentUser,
  } = useHrms();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  
  // Vault modal state
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [vaultTargetEmp, setVaultTargetEmp] = useState<Employee | null>(null);

  // Modal state for Add Department
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptForm, setNewDeptForm] = useState<{
    departmentName: string;
    departmentCode: string;
    headEmpId: string;
    units: Array<{ unitName: string; unitHeadId: string }>;
  }>({
    departmentName: '',
    departmentCode: '',
    headEmpId: '',
    units: [{ unitName: '', unitHeadId: '' }],
  });

  const handleAddUnitRow = () => {
    setNewDeptForm((prev) => ({
      ...prev,
      units: [...prev.units, { unitName: '', unitHeadId: '' }],
    }));
  };

  const handleRemoveUnitRow = (index: number) => {
    setNewDeptForm((prev) => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateUnitRow = (index: number, field: 'unitName' | 'unitHeadId', value: string) => {
    setNewDeptForm((prev) => {
      const copy = [...prev.units];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, units: copy };
    });
  };
  
  // Modal states for HR Assignment
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    type: 'dept_head' | 'unit_head' | 'facility_head';
    departmentName: string;
    unitName?: string;
    currentHeadId?: string;
  }>({
    open: false,
    type: 'dept_head',
    departmentName: '',
  });

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [assignSigPreview, setAssignSigPreview] = useState<string>('');
  const [assignSigMode, setAssignSigMode] = useState<'existing' | 'upload' | 'generate'>('existing');
  const [newUnitModal, setNewUnitModal] = useState({ open: false, departmentName: '', unitName: '', headId: '' });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isHR = activeRole === 'super_admin' || activeRole === 'hr_director' || activeRole === 'hr_manager';

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Helper to generate stylized SVG script signature for newly appointed head
  const generateScriptSignature = (fullName: string, code: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 450, 140);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(430, 100);
    ctx.stroke();

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic bold 30px "Brush Script MT", "Segoe Script", "Great Vibes", cursive, sans-serif';
    ctx.fillText(fullName, 30, 75);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 9px "Segoe UI", sans-serif';
    ctx.fillText(`✓ CHST HR VERIFIED DIGITAL SIGNATURE • ${new Date().toLocaleDateString()}`, 30, 118);

    ctx.fillStyle = '#64748b';
    ctx.font = '8px "Segoe UI", sans-serif';
    ctx.fillText(`AUTH: HR DIRECTORATE • ID: ${code || 'PJ-AUTH'}`, 30, 130);

    return canvas.toDataURL('image/png');
  };

  const handleOpenAssignModal = (
    type: 'dept_head' | 'unit_head' | 'facility_head',
    departmentName: string,
    unitName?: string,
    currentHeadId?: string
  ) => {
    const initialId = currentHeadId || employees[0]?.id || '';
    setAssignModal({
      open: true,
      type,
      departmentName,
      unitName,
      currentHeadId,
    });
    setSelectedEmpId(initialId);

    const emp = employees.find((e) => e.id === initialId);
    if (emp?.digitalSignatureUrl) {
      setAssignSigPreview(emp.digitalSignatureUrl);
      setAssignSigMode('existing');
    } else if (emp) {
      const generated = generateScriptSignature(`${emp.firstName} ${emp.lastName}`, emp.empCode || 'PJ-AUTH');
      setAssignSigPreview(generated);
      setAssignSigMode('generate');
    } else {
      setAssignSigPreview('');
      setAssignSigMode('upload');
    }
  };

  const handleSelectEmpInAssignModal = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp?.digitalSignatureUrl) {
      setAssignSigPreview(emp.digitalSignatureUrl);
      setAssignSigMode('existing');
    } else if (emp) {
      const generated = generateScriptSignature(`${emp.firstName} ${emp.lastName}`, emp.empCode || 'PJ-AUTH');
      setAssignSigPreview(generated);
      setAssignSigMode('generate');
    } else {
      setAssignSigPreview('');
    }
  };

  const handleFileUploadInAssignModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAssignSigPreview(event.target.result as string);
        setAssignSigMode('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const emp = employees.find((e) => e.id === selectedEmpId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Selected Staff';

    // If signature provided, save to employee profile so it's active for leave signoffs
    if (assignSigPreview && (!emp?.digitalSignatureUrl || assignSigMode !== 'existing')) {
      await uploadEmployeeDigitalSignature(
        selectedEmpId,
        assignSigPreview,
        `${currentUser?.name || 'Miss Vero'} (HR Directorate)`
      );
    }

    if (assignModal.type === 'dept_head') {
      assignDepartmentHead(assignModal.departmentName, selectedEmpId);
      showToast(`Assigned ${empName} as Department Head (HOD) with verified digital signature`);
    } else if (assignModal.type === 'unit_head' && assignModal.unitName) {
      assignUnitHead(assignModal.departmentName, assignModal.unitName, selectedEmpId);
      showToast(`Assigned ${empName} as Unit Head (HOU) with verified digital signature`);
    } else if (assignModal.type === 'facility_head') {
      setFacilityHead(selectedEmpId);
      showToast(`Assigned ${empName} as Head of Facility (CMO / CEO) with verified digital signature`);
    }

    setAssignModal({ open: false, type: 'dept_head', departmentName: '' });
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitModal.unitName.trim()) return;

    addUnitToDepartment(newUnitModal.departmentName, newUnitModal.unitName, newUnitModal.headId || undefined);
    showToast(`Created Unit '${newUnitModal.unitName}' under ${newUnitModal.departmentName}`);
    setNewUnitModal({ open: false, departmentName: '', unitName: '', headId: '' });
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptForm.departmentName.trim()) return;

    const selectedHeadEmp = employees.find((emp) => emp.id === newDeptForm.headEmpId);
    const code = newDeptForm.departmentCode.trim() || `${newDeptForm.departmentName.substring(0, 4).toUpperCase()}-DEPT`;

    const validUnits = newDeptForm.units.filter((u) => u.unitName.trim().length > 0);

    addDepartment({
      departmentName: newDeptForm.departmentName.trim(),
      departmentCode: code,
      departmentHeadId: selectedHeadEmp?.id,
      departmentHeadName: selectedHeadEmp ? `${selectedHeadEmp.firstName} ${selectedHeadEmp.lastName}` : undefined,
      departmentHeadEmail: selectedHeadEmp ? selectedHeadEmp.email : undefined,
      units: validUnits.map((u) => ({
        unitName: u.unitName.trim(),
        unitHeadId: u.unitHeadId || undefined,
      })),
    });

    showToast(`Created department '${newDeptForm.departmentName}' (${code}) with ${validUnits.length || 1} unit(s)`);
    setIsAddDeptModalOpen(false);
    setNewDeptForm({
      departmentName: '',
      departmentCode: '',
      headEmpId: '',
      units: [{ unitName: '', unitHeadId: '' }],
    });
  };

  // Facility Head reference (shared across hospital)
  const currentFacilityHead = (departmentLeadership || [])[0]?.facilityHeadName
    ? {
        id: (departmentLeadership || [])[0].facilityHeadId,
        name: (departmentLeadership || [])[0].facilityHeadName,
        email: (departmentLeadership || [])[0].facilityHeadEmail,
      }
    : null;

  const filteredLeaderships = (departmentLeadership || []).filter((dl) => {
    if (!dl) return false;
    const matchesDept = selectedDeptFilter === 'All' || dl.departmentName === selectedDeptFilter;
    const matchesSearch =
      (dl.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dl.departmentHeadName && dl.departmentHeadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dl.units || []).some(
        (u) =>
          u &&
          ((u.unitName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.unitHeadName && u.unitHeadName.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-xl text-xs font-semibold animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                HR Leadership Governance
              </span>
              <span className="text-slate-400 text-xs">• 4-Tier Approval Authority Chain</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-400" />
              Department & Unit Leadership Governance
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Human Resources administrative console to assign, reassign, and manage <strong className="text-emerald-300">Department Heads (HOD)</strong>, <strong className="text-cyan-300">Unit Heads (HOU)</strong>, and <strong className="text-amber-300">Head of Facility</strong> required for sequential request approval workflows.
            </p>
          </div>

          {/* Facility Head Badge & HR Action */}
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-xl bg-slate-900/90 p-3 border border-amber-500/30 text-right min-w-[220px]">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                <Crown className="h-3 w-3 text-amber-400" /> Head of Facility (Tier 4)
              </div>
              <div className="text-sm font-extrabold text-white">
                {currentFacilityHead?.name || 'Dr. Arthur Kingsley'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentFacilityHead?.email || 'a.kingsley@stjudehealth.org'}
              </div>
              {isHR && (
                <button
                  onClick={() => handleOpenAssignModal('facility_head', 'All Facility Units', undefined, currentFacilityHead?.id)}
                  className="mt-2 text-[10px] font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 ml-auto"
                >
                  <UserCheck className="h-3 w-3" /> Reassign Facility Head
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4-Tier Sequential Approval Chain Preview */}
        <div className="mt-6 pt-5 border-t border-slate-700/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Mandatory 4-Tier Approval Hierarchy Structure
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900/70 p-3 border border-cyan-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-cyan-400 mb-1">
                <span>TIER 1</span>
                <span>UNIT HEAD</span>
              </div>
              <div className="font-bold text-white text-[11px]">Unit Leadership (HOU)</div>
              <div className="text-[10px] text-slate-400 mt-1">Operational unit shift coverage & staffing check</div>
            </div>

            <div className="rounded-xl bg-slate-900/70 p-3 border border-indigo-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-indigo-400 mb-1">
                <span>TIER 2</span>
                <span>DEPARTMENT HEAD</span>
              </div>
              <div className="font-bold text-white text-[11px]">Departmental Lead (HOD)</div>
              <div className="text-[10px] text-slate-400 mt-1">Specialty headcount & clinical roster review</div>
            </div>

            <div className="rounded-xl bg-slate-900/70 p-3 border border-emerald-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-400 mb-1">
                <span>TIER 3</span>
                <span>HR DIRECTOR / MGR</span>
              </div>
              <div className="font-bold text-white text-[11px]">Human Resources</div>
              <div className="text-[10px] text-slate-400 mt-1">Contract compliance, leave balance & policy check</div>
            </div>

            <div className="rounded-xl bg-slate-900/70 p-3 border border-amber-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-400 mb-1">
                <span>TIER 4</span>
                <span>FACILITY HEAD</span>
              </div>
              <div className="font-bold text-white text-[11px]">Head of Facility / CEO</div>
              <div className="text-[10px] text-slate-400 mt-1">Final executive sign-off & authorization</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search department, unit, HOD, or unit head name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Departments</option>
            {departmentLeadership.map((d) => (
              <option key={d.id} value={d.departmentName}>
                {d.departmentName}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setVaultTargetEmp(null);
              setIsVaultModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold shadow transition active:scale-95 whitespace-nowrap"
          >
            <PenTool className="h-4 w-4 text-emerald-400" /> Approvers Signature Vault
          </button>

          <button
            onClick={() => setIsAddDeptModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-bold text-white shadow transition active:scale-95 border border-emerald-400/30 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> (ADD DEPARTMENT)
          </button>
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredLeaderships.length}</strong> Departments & Units
        </div>
      </div>

      {/* Department Leadership Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredLeaderships.map((dept) => {
          const deptHeadEmp = employees.find((e) => e.id === dept.departmentHeadId);
          const hasHODSignature = !!deptHeadEmp?.digitalSignatureUrl;

          return (
            <div
              key={dept.id}
              className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden"
            >
              {/* Department Header Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {dept.departmentName}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {dept.departmentCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {dept.units.length} Functional Clinical Units • Responsible for Tier 2 Departmental Approvals
                    </p>
                  </div>
                </div>

                {/* HOD Card & HR Action */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-slate-700">
                  <div className="relative">
                    <img
                      src={
                        deptHeadEmp?.photo ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={dept.departmentHeadName || 'HOD'}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500"
                    />
                    <Crown className="h-3.5 w-3.5 text-amber-400 absolute -top-1 -right-1 fill-amber-400" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Award className="h-3 w-3" /> Head of Department (HOD - Tier 2)
                      </span>
                      {deptHeadEmp && (
                        hasHODSignature ? (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                            <FileCheck className="h-2.5 w-2.5" /> Sig Verified
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Sig Missing
                          </span>
                        )
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {dept.departmentHeadName || 'Unassigned (Select HOD)'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {dept.departmentHeadEmail || 'Pending HR Assignment'}
                    </div>
                  </div>

                  {isHR && (
                    <div className="flex items-center gap-1.5 ml-2">
                      {deptHeadEmp && !hasHODSignature && (
                        <button
                          onClick={() => {
                            setVaultTargetEmp(deptHeadEmp);
                            setIsVaultModalOpen(true);
                          }}
                          className="rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 p-1.5 text-[11px] font-bold hover:bg-amber-500/20"
                          title="Upload official signature for HOD"
                        >
                          <PenTool className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenAssignModal('dept_head', dept.departmentName, undefined, dept.departmentHeadId)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-indigo-500 transition"
                      >
                        {dept.departmentHeadId ? 'Change HOD' : 'Assign HOD'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Units List */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-cyan-500" />
                    Unit Leadership (Tier 1 Approvers)
                  </h4>

                  {isHR && (
                    <button
                      onClick={() =>
                        setNewUnitModal({ open: true, departmentName: dept.departmentName, unitName: '', headId: '' })
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add New Clinical Unit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dept.units.map((unit) => {
                    const unitHeadEmp = employees.find((e) => e.id === unit.unitHeadId);
                    const hasHOUSignature = !!unitHeadEmp?.digitalSignatureUrl;

                    return (
                      <div
                        key={unit.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover:border-cyan-500/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              unitHeadEmp?.photo ||
                              'https://images.unsplash.com/photo-1594824813566-78a9327d3b5b?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={unit.unitHeadName || 'Unit Head'}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                                {unit.unitName}
                              </span>
                              {unitHeadEmp && (
                                hasHOUSignature ? (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    ✓ Sig On File
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    Sig Missing
                                  </span>
                                )
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="h-3 w-3" />
                              HOU: {unit.unitHeadName || 'Unassigned (Select Unit Head)'}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {unit.unitHeadEmail || 'No Email Registered'} • {unit.staffCount} Staff Members
                            </div>
                          </div>
                        </div>

                        {isHR && (
                          <div className="flex items-center gap-1.5">
                            {unitHeadEmp && !hasHOUSignature && (
                              <button
                                onClick={() => {
                                  setVaultTargetEmp(unitHeadEmp);
                                  setIsVaultModalOpen(true);
                                }}
                                className="rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 p-1.5 text-[11px] font-bold hover:bg-amber-500/20"
                                title="Upload official signature for Unit Head"
                              >
                                <PenTool className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleOpenAssignModal('unit_head', dept.departmentName, unit.unitName, unit.unitHeadId)
                              }
                              className="rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-3 py-1.5 text-[11px] font-bold hover:bg-cyan-600 hover:text-white transition"
                            >
                              {unit.unitHeadId ? 'Change HOU' : 'Assign HOU'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department Governance Log */}
              <div className="bg-slate-100/70 dark:bg-slate-950/60 px-5 py-2.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <span>
                  Last HR Leadership Update: <strong>{dept.lastAssignedBy || 'HR Administration'}</strong>
                </span>
                <span>
                  Timestamp: {dept.lastAssignedAt ? new Date(dept.lastAssignedAt).toLocaleDateString() : 'Active System Standard'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Assign Head (HOD, HOU, Facility Head) with Integrated Digital Signature Upload */}
      {assignModal.open && (() => {
        const selectedAssignEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h3 className="font-black text-base">
                    HR Leadership Appointment & Signature Authorization
                  </h3>
                </div>
                <button
                  onClick={() => setAssignModal({ open: false, type: 'dept_head', departmentName: '' })}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 mb-4 text-xs space-y-1 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-semibold">Leadership Role:</span>{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {assignModal.type === 'dept_head'
                        ? `Head of Department (Tier 2: ${assignModal.departmentName})`
                        : assignModal.type === 'unit_head'
                        ? `Head of Unit (Tier 1: ${assignModal.unitName} - ${assignModal.departmentName})`
                        : 'Head of Facility (Tier 4: CMO / CEO)'}
                    </strong>
                  </div>
                </div>
              </div>

              <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    1. Select Staff Member for Leadership Appointment
                  </label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => handleSelectEmpInAssignModal(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} — {emp.jobTitle} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

              {/* Digital Signature Management Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <PenTool className="h-4 w-4 text-emerald-600" />
                    2. Official Digital Signature (Uploaded by HR)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedAssignEmp?.digitalSignatureUrl ? '✓ Active on Record' : '⚠️ Missing - Attach Below'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hospital policy requires HR to upload and verify the official digital signature of all appointed Four-Tier Approvers (HOU, HOD, HR, CMO).
                </p>

                {/* Signature Preview & Actions */}
                <div className="space-y-2">
                  {assignSigPreview ? (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400">SIGNATURE PREVIEW / READY FOR SIGN-OFF</div>
                      <div className="flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-950 rounded-lg min-h-[60px]">
                        {assignSigPreview.startsWith('data:image') || assignSigPreview.startsWith('http') ? (
                          <img
                            src={assignSigPreview}
                            alt="Signature Preview"
                            className="max-h-16 max-w-full object-contain"
                          />
                        ) : (
                          <div className="font-serif italic font-extrabold text-base text-indigo-700 dark:text-indigo-300">
                            {assignSigPreview.replace('style:', '')}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-amber-800 text-[11px] text-center">
                      No digital signature attached yet. Choose an option below.
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer shadow transition">
                      <Upload className="h-3.5 w-3.5" /> Upload File (PNG/JPG)
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUploadInAssignModal}
                        className="hidden"
                      />
                    </label>

                    {selectedAssignEmp && (
                      <button
                        type="button"
                        onClick={() => {
                          const generated = generateScriptSignature(
                            `${selectedAssignEmp.firstName} ${selectedAssignEmp.lastName}`,
                            selectedAssignEmp.empCode || 'PJ-AUTH'
                          );
                          setAssignSigPreview(generated);
                          setAssignSigMode('generate');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] transition"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Auto-Generate Stylized Script
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                ✓ Once appointed, this staff member will be granted <strong>Tier {assignModal.type === 'unit_head' ? '1 (Unit Head)' : assignModal.type === 'dept_head' ? '2 (Department Head)' : '4 (Head of Facility)'}</strong> approval authority over requests submitted within their jurisdiction.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModal({ open: false, type: 'dept_head', departmentName: '' })}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500"
                >
                  Confirm Appointment & Signatures
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}

      {/* Vault Modal */}
      <HRSignatureVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => {
          setIsVaultModalOpen(false);
          setVaultTargetEmp(null);
        }}
        targetEmployee={vaultTargetEmp}
      />

      {/* Modal 2: Create New Unit */}
      {/* Modal for Adding New Department */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base mb-1 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-500" />
              Add New Hospital Department & Units
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Register a new administrative or clinical department, assign a Department Head (HOD - Tier 2 Approver), and define operational units with their assigned Unit Heads (HOU - Tier 3 Approvers).
            </p>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dental & Maxillofacial Care"
                    value={newDeptForm.departmentName}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, departmentName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Department Code</label>
                  <input
                    type="text"
                    placeholder="e.g. DENT-DEPT"
                    value={newDeptForm.departmentCode}
                    onChange={(e) => setNewDeptForm({ ...newDeptForm, departmentCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Initial Department Head (HOD - Tier 2 Approver)
                </label>
                <select
                  value={newDeptForm.headEmpId}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, headEmpId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Select Enrolled Staff Member (Optional) --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle} • {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Units under Department section */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <FolderPlus className="h-4 w-4 text-emerald-500" />
                      Department Units & Assigned Unit Heads (HOU)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Add operational units under this department and assign Unit Heads (Tier 3 Approvers).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUnitRow}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Unit
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {newDeptForm.units.map((unitItem, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
                          Unit #{index + 1}
                        </span>
                        {newDeptForm.units.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveUnitRow(index)}
                            className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-500/10 transition"
                            title="Remove unit"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                            Unit Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Dental OPD Clinic / Surgery Bay"
                            value={unitItem.unitName}
                            onChange={(e) => handleUpdateUnitRow(index, 'unitName', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                            Assigned Unit Head (HOU - Tier 3)
                          </label>
                          <select
                            value={unitItem.unitHeadId}
                            onChange={(e) => handleUpdateUnitRow(index, 'unitHeadId', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="">-- Select Unit Head --</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} ({emp.jobTitle})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500 transition flex items-center gap-1.5"
                >
                  <Building2 className="h-4 w-4" />
                  Register Department & Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {newUnitModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <h3 className="font-extrabold text-base mb-1 flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-500" />
              Add New Clinical Unit
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a new operational unit under <strong>{newUnitModal.departmentName}</strong>.
            </p>

            <form onSubmit={handleCreateUnit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Unit Name (e.g., Trauma Bay B, Ward 4, ICU-2)</label>
                <input
                  type="text"
                  required
                  placeholder="Enter unit name..."
                  value={newUnitModal.unitName}
                  onChange={(e) => setNewUnitModal({ ...newUnitModal, unitName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Initial Unit Head (HOU - Tier 1 Approver)</label>
                <select
                  value={newUnitModal.headId}
                  onChange={(e) => setNewUnitModal({ ...newUnitModal, headId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                >
                  <option value="">Select Unit Head (Optional)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewUnitModal({ open: false, departmentName: '', unitName: '', headId: '' })}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 px-5 py-2 font-bold text-white shadow hover:bg-cyan-500"
                >
                  Create Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
