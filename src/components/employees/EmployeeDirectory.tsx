import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Award,
  FileText,
  Building,
  ChevronRight,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Key,
  Send,
  Lock,
  Copy,
  Check,
  ExternalLink,
  UserCheck,
  RefreshCw,
  Sparkles,
  Building2,
  Eye,
  EyeOff,
  UserPlus,
  Pencil,
  Save,
  PlusCircle,
  FileCheck,
  Briefcase,
  User,
  CreditCard,
  FileSpreadsheet,
  Stethoscope,
  HeartPulse,
  Crown,
  GitFork,
  Camera,
  Upload,
  GraduationCap,
  PhoneCall,
  Paperclip,
  MapPin,
  Calendar,
  BadgeCheck,
  FileUp,
  FolderArchive,
  TrendingUp,
  ArrowRightLeft,
  Printer,
  History,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import {
  Employee,
  MedicalLicense,
  EmailDispatchResult,
  EducationItem,
  EmergencyContact,
  OfficialDocument,
  GhanaCardInfo,
  StaffMovementRecord,
  EmploymentSource,
  TransferType,
} from '../../types/hrms';
import { DepartmentLeadershipManager } from './DepartmentLeadershipManager';
import { OrgHierarchyView } from './OrgHierarchyView';
import { CreateStaffAccountModal } from './CreateStaffAccountModal';
import { PromotionTrackingDashboard } from './PromotionTrackingDashboard';
import { StaffTransferRegistry } from './StaffTransferRegistry';
import { EditEmployeeModal } from './EditEmployeeModal';
import { DigitalStaffFileModal } from './DigitalStaffFileModal';
import { EmployeePhotoModal } from '../common/EmployeePhotoModal';
import { EmployeePhotoUploader } from '../common/EmployeePhotoUploader';

export const EmployeeDirectory: React.FC = () => {
  const {
    employees,
    formatCurrency,
    addEmployee,
    updateEmployee,
    updateEmployeePhoto,
    deleteEmployee,
    clearAllEmployees,
    enrollHeadOfFacility,
    enrollHrLeader,
    selectedHospital,
    createEmployeePortalAccount,
    batchCreateAndInvitePortalAccounts,
    sendPortalInviteEmail,
    sendPortalInviteSms,
    staffFiles,
    uploadStaffFile,
    deleteStaffFile,
    toggleStaffFilePermission,
    recordStaffMovement,
    activeRole,
    currentUser,
    departmentLeadership,
    clearAllDepartments,
    lastStaffAction,
    clearLastStaffAction,
  } = useHrms();

  // Active Main View: 'directory' (Cards/Profiles) | 'portal_accounts' (Logins & Portal Invites) | 'leadership' (HOD/HOU Governance) | 'hierarchy' (Interactive Org Chart) | 'promotions' (Staff Promotions & Forecasting) | 'transfers' (Staff Transfers & Movement Registry)
  const [activeView, setActiveView] = useState<'directory' | 'portal_accounts' | 'leadership' | 'hierarchy' | 'promotions' | 'transfers'>('directory');

  // Staff Deletion & Reset Confirmation Modals
  const [staffToDelete, setStaffToDelete] = useState<Employee | null>(null);
  const [isDeleteAllStaffModalOpen, setIsDeleteAllStaffModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);

  // Permission Check: only executives / HR leadership or empty database can enroll Head/HR leadership
  const canEnrollLeadership =
    activeRole === 'super_admin' ||
    activeRole === 'facility_head' ||
    activeRole === 'hr_director' ||
    activeRole === 'hr_manager' ||
    (employees || []).length === 0;

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [mechanisationFilter, setMechanisationFilter] = useState<string>('All');
  const [inviteStatusFilter, setInviteStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [transferTypeFilter, setTransferTypeFilter] = useState<string>('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateHrAccountModalOpen, setIsCreateHrAccountModalOpen] = useState(false);
  const [isEnrollHeadModalOpen, setIsEnrollHeadModalOpen] = useState(false);
  const [isEnrollingHead, setIsEnrollingHead] = useState(false);
  const [isEnrollHrModalOpen, setIsEnrollHrModalOpen] = useState(false);
  const [isEnrollingHr, setIsEnrollingHr] = useState(false);

  const [enrollHeadForm, setEnrollHeadForm] = useState({
    firstName: 'Rev. Fr. Michael',
    lastName: 'Afoakwah',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    empCode: 'EMP-3522',
    email: 'rev.fr.michael@pjpiimc.org',
    phone: '+233 24 222 1000',
    password: 'EMP-3522',
    jobTitle: 'Head of Facility / Chief Executive Officer',
  });

  const [enrollHrForm, setEnrollHrForm] = useState({
    firstName: 'Mr. Kwabena',
    lastName: 'Antwi',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    role: 'hr_director' as 'hr_director' | 'hr_manager',
    empCode: 'EMP-1976',
    email: 'kwabena.antwi@pjpiimc.org',
    phone: '+233 24 555 2000',
    password: 'EMP-1976',
    jobTitle: 'Director of Human Resources',
  });

  // EDIT EMPLOYEE STATE
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editActiveTab, setEditActiveTab] = useState<
    'general' | 'documents' | 'education' | 'contacts' | 'employment' | 'movements' | 'licenses' | 'health'
  >('general');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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
    employmentSource: 'Transfer',
    previousDepartment: '',
    newDepartment: '',
    previousPosition: '',
    newPosition: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    previousOrganisation: 'PJPIIMC Central',
    reason: 'Operational rotation & clinical staff re-allocation',
    approvingAuthority: 'Dr. Kwame Boateng (Chief Medical Officer)',
    referenceNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  });
  const [showAddMovementFormInModal, setShowAddMovementFormInModal] = useState(false);

  // DIGITAL FILE DOSSIER MODAL STATE
  const [digitalFileActiveTab, setDigitalFileActiveTab] = useState<'documents' | 'overview' | 'transfers' | 'licenses'>('documents');
  const [quickDocTitle, setQuickDocTitle] = useState('');
  const [quickDocCategory, setQuickDocCategory] = useState<OfficialDocument['type']>('Appointment Letter');
  const [quickDocFileName, setQuickDocFileName] = useState('');
  const [quickDocFileUrl, setQuickDocFileUrl] = useState('');
  const [quickDocNotes, setQuickDocNotes] = useState('');

  const handleDirectDocUploadInModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedEmployee) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setQuickDocFileName(file.name);
        setQuickDocFileUrl(dataUrl);
        if (!quickDocTitle) {
          setQuickDocTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDirectDocInModal = () => {
    if (!selectedEmployee || !quickDocTitle || !quickDocFileUrl) return;

    const newDoc: OfficialDocument = {
      id: `doc-${Date.now()}`,
      title: quickDocTitle,
      type: quickDocCategory,
      fileUrl: quickDocFileUrl,
      fileName: quickDocFileName || 'Document.pdf',
      fileSize: 1024 * 180,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'HR Officer',
      notes: quickDocNotes,
    };

    const updatedDocs = [newDoc, ...(selectedEmployee.officialDocuments || [])];

    let updatedEmp: Employee = {
      ...selectedEmployee,
      officialDocuments: updatedDocs,
    };

    if (quickDocCategory === 'Appointment Letter') {
      updatedEmp.appointmentLetterUrl = quickDocFileUrl;
      updatedEmp.appointmentLetterName = quickDocFileName;
    } else if (quickDocCategory === 'Assumption of Duty Letter') {
      updatedEmp.assumptionOfDutyUrl = quickDocFileUrl;
      updatedEmp.assumptionOfDutyName = quickDocFileName;
    } else if (quickDocCategory === 'Transfer Document') {
      updatedEmp.transferDocumentUrl = quickDocFileUrl;
      updatedEmp.transferDocumentName = quickDocFileName;
    }

    updateEmployee(selectedEmployee.id, updatedEmp);
    setSelectedEmployee(updatedEmp);

    setQuickDocTitle('');
    setQuickDocFileName('');
    setQuickDocFileUrl('');
    setQuickDocNotes('');
    showToast('success', 'Document Saved to Staff File', `Successfully attached ${newDoc.title} to ${selectedEmployee.firstName}'s digital file.`);
  };

  const handleDeleteOfficialDocInModal = (docId: string) => {
    if (!selectedEmployee) return;
    const updatedDocs = (selectedEmployee.officialDocuments || []).filter((d) => d.id !== docId);
    const updatedEmp = {
      ...selectedEmployee,
      officialDocuments: updatedDocs,
    };
    updateEmployee(selectedEmployee.id, updatedEmp);
    setSelectedEmployee(updatedEmp);
    showToast('info', 'Document Removed', 'Removed document from employee digital file.');
  };

  // New Education Form State
  const [newEduInst, setNewEduInst] = useState('');
  const [newEduQual, setNewEduQual] = useState('');
  const [newEduField, setNewEduField] = useState('');
  const [newEduStartYear, setNewEduStartYear] = useState('');
  const [newEduGradYear, setNewEduGradYear] = useState('');
  const [newEduGrade, setNewEduGrade] = useState('');
  const [newEduCertUrl, setNewEduCertUrl] = useState('');
  const [newEduCertName, setNewEduCertName] = useState('');

  // New Emergency Contact Form State
  const [newContactName, setNewContactName] = useState('');
  const [newContactRel, setNewContactRel] = useState('Spouse');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactAltPhone, setNewContactAltPhone] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  // New Official Document Form State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<OfficialDocument['type']>('Appointment Letter');
  const [newDocFileName, setNewDocFileName] = useState('');
  const [newDocFileUrl, setNewDocFileUrl] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');

  // Portal Credentials Management State
  const [selectedStaffForBatch, setSelectedStaffForBatch] = useState<string[]>([]);
  const [batchUsernameType, setBatchUsernameType] = useState<'email' | 'empCode'>('email');
  const [batchPasswordType, setBatchPasswordType] = useState<'empCode' | 'email'>('empCode');
  const [copiedCredEmpId, setCopiedCredEmpId] = useState<string | null>(null);

  // Toast Alert & Email Dispatch Preview Modals
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title: string; desc: string } | null>(null);
  const [emailDispatchModal, setEmailDispatchModal] = useState<EmailDispatchResult | null>(null);
  const [missingEmailModalEmp, setMissingEmailModalEmp] = useState<Employee | null>(null);
  const [promptEmailValue, setPromptEmailValue] = useState('');
  const [emailDispatchLog, setEmailDispatchLog] = useState<EmailDispatchResult[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, desc: string) => {
    setToast({ type, title, desc });
    setTimeout(() => setToast(null), 5000);
  };

  const handleTriggerSendInvite = async (empId: string) => {
    const target = employees.find((e) => e.id === empId);
    if (!target) return;

    if (!target.email || !target.email.includes('@')) {
      setMissingEmailModalEmp(target);
      setPromptEmailValue('');
      return;
    }

    showToast('info', 'Dispatching Email...', `Sending credentials email to ${target.email}`);
    const result = await sendPortalInviteEmail(empId);

    if (result.success) {
      setEmailDispatchModal(result);
      setEmailDispatchLog((prev) => [result, ...prev]);
      showToast('success', 'Email Dispatched', `Credentials email sent to ${result.recipientEmail}`);
    } else {
      showToast('error', 'Email Delivery Failed', result.error || 'Failed to dispatch email.');
    }
  };

  const handleTriggerSendSmsInvite = async (empId: string) => {
    const target = employees.find((e) => e.id === empId);
    if (!target) return;

    if (!target.phone || target.phone.trim().length < 5) {
      showToast('error', 'Missing Phone Number', `Staff member ${target.firstName} ${target.lastName} has no phone number configured.`);
      return;
    }

    showToast('info', 'Dispatching Cellular SMS...', `Sending portal credentials SMS to ${target.phone}`);
    const result = await sendPortalInviteSms(empId);

    if (result.success) {
      setEmailDispatchModal(result);
      setEmailDispatchLog((prev) => [result, ...prev]);
      showToast('success', 'SMS Dispatched', `Credentials sent via SMS to ${result.recipientPhone || target.phone}`);
    } else {
      showToast('error', 'SMS Delivery Failed', result.error || 'Failed to dispatch SMS.');
    }
  };

  const handleSaveMissingEmailAndSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingEmailModalEmp || !promptEmailValue.includes('@')) {
      showToast('error', 'Invalid Email', 'Please provide a valid work email address.');
      return;
    }

    updateEmployee(missingEmailModalEmp.id, { email: promptEmailValue });
    const empId = missingEmailModalEmp.id;
    const empName = `${missingEmailModalEmp.firstName} ${missingEmailModalEmp.lastName}`;
    setMissingEmailModalEmp(null);

    showToast('info', 'Saving Email & Sending Invite', `Saved email ${promptEmailValue} for ${empName}. Dispatched credentials.`);
    const result = await sendPortalInviteEmail(empId);

    if (result.success) {
      setEmailDispatchModal(result);
      setEmailDispatchLog((prev) => [result, ...prev]);
      showToast('success', 'Email Dispatched', `Credentials sent to ${result.recipientEmail}`);
    } else {
      showToast('error', 'Email Dispatch Failed', result.error || 'Failed to dispatch email.');
    }
  };

  // Single Portal Account Manager Modal State
  const [portalAccountModalEmp, setPortalAccountModalEmp] = useState<Employee | null>(null);
  const [singleUsernameType, setSingleUsernameType] = useState<'email' | 'empCode'>('email');
  const [singlePasswordType, setSinglePasswordType] = useState<'empCode' | 'email' | 'custom'>('custom');
  const [singleCustomPassword, setSingleCustomPassword] = useState('');
  const [showSingleCustomPassword, setShowSingleCustomPassword] = useState(false);
  const [singleRequireChangeOnLogin, setSingleRequireChangeOnLogin] = useState(true);
  const [singleSendEmailNotification, setSingleSendEmailNotification] = useState(true);
  const [singleSendSmsNotification, setSingleSendSmsNotification] = useState(false);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const handleGenerateRandomPassword = () => {
    const prefixes = ['Hospital', 'StJude', 'PJPIIMC', 'Health', 'GhanaMed', 'Care'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const year = '2026';
    const special = ['!', '#', '@', '$'][Math.floor(Math.random() * 4)];
    const num = Math.floor(100 + Math.random() * 900);
    const pass = `${prefix}${year}${special}${num}`;
    setSingleCustomPassword(pass);
    setSinglePasswordType('custom');
    setShowSingleCustomPassword(true);
  };

  // Standalone Photo Upload Modal State
  const [photoModalEmp, setPhotoModalEmp] = useState<Employee | null>(null);

  // New employee form state
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    photo: '',
    email: '',
    phone: '',
    jobTitle: 'Staff Nurse',
    department: departmentLeadership[0]?.departmentName || 'Intensive Care Unit (ICU)',
    salary: 7500,
    role: 'nurse',
    mechanisationStatus: 'Mechanised' as 'Mechanised' | 'Non-Mechanised',
    usernameType: 'email' as 'email' | 'empCode',
    passwordType: 'empCode' as 'empCode' | 'email',
    sendInviteNow: true,
  });

  const filteredEmployees = (employees || []).filter((e) => {
    if (!e) return false;
    const matchesSearch =
      `${e.firstName || ''} ${e.lastName || ''} ${e.empCode || ''} ${e.email || ''} ${e.jobTitle || ''} ${e.gender || ''} ${e.previousOrganisation || ''} ${e.previousPosition || ''} ${e.previousDepartment || ''} ${e.transferReferenceNumber || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || e.department === deptFilter;
    const matchesSource = sourceFilter === 'All' || e.employmentSource === sourceFilter;
    const matchesTransferType = transferTypeFilter === 'All' || e.transferType === transferTypeFilter;
    const empMech = e.mechanisationStatus || (e.employmentType === 'Contract' || (e.employmentType as any) === 'Locum' ? 'Non-Mechanised' : 'Mechanised');
    const matchesMechanisation = mechanisationFilter === 'All' || empMech === mechanisationFilter;

    let matchesInvite = true;
    if (inviteStatusFilter === 'Sent') {
      matchesInvite = e.portalAccess?.inviteStatus === 'Invitation Sent';
    } else if (inviteStatusFilter === 'Activated') {
      matchesInvite = e.portalAccess?.inviteStatus === 'Portal Activated';
    } else if (inviteStatusFilter === 'Not Invited') {
      matchesInvite = !e.portalAccess || e.portalAccess?.inviteStatus === 'Not Invited';
    }

    return matchesSearch && matchesDept && matchesSource && matchesTransferType && matchesInvite && matchesMechanisation;
  });

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.lastName) return;

    const defaultPhoto =
      newEmp.photo ||
      (newEmp.gender === 'Female'
        ? 'https://images.unsplash.com/photo-1594824813566-78a9327d3b5b?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80');

    const createdEmp = addEmployee({
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      gender: newEmp.gender,
      photo: defaultPhoto,
      email: newEmp.email,
      phone: newEmp.phone,
      jobTitle: newEmp.jobTitle,
      department: newEmp.department,
      salary: Number(newEmp.salary),
      role: newEmp.role as any,
      mechanisationStatus: newEmp.mechanisationStatus,
      medicalLicenses: [
        {
          id: `lic-new-${Date.now()}`,
          licenseType: 'BLS',
          licenseNumber: 'BLS-NEW-991',
          issueDate: '2025-01-10',
          expiryDate: '2027-01-10',
          issuingAuthority: 'American Heart Association',
          status: 'Active',
          verified: true,
        },
      ],
    });

    setIsAddModalOpen(false);

    if (newEmp.sendInviteNow && createdEmp) {
      if (newEmp.email && newEmp.email.includes('@')) {
        const result = await sendPortalInviteEmail(createdEmp.id);
        if (result.success) {
          setEmailDispatchModal(result);
          setEmailDispatchLog((prev) => [result, ...prev]);
          showToast('success', 'Staff Added & Credentials Emailed', `Dispatched portal invitation email to ${result.recipientEmail}`);
        }
      } else {
        showToast('info', 'Staff Added (No Email)', 'Profile created. Enter email in profile to send portal credentials.');
      }
    } else {
      showToast('success', 'Staff Account Created', `Created employee profile for ${createdEmp.firstName} ${createdEmp.lastName}.`);
    }

    setNewEmp({
      firstName: '',
      lastName: '',
      gender: 'Female',
      photo: '',
      email: '',
      phone: '',
      jobTitle: 'Staff Nurse',
      department: departmentLeadership[0]?.departmentName || 'Intensive Care Unit (ICU)',
      salary: 7500,
      role: 'nurse',
      mechanisationStatus: 'Mechanised',
      usernameType: 'email',
      passwordType: 'empCode',
      sendInviteNow: true,
    });
  };

  // EDIT EMPLOYEE HANDLERS
  const handleOpenEditModal = (emp: Employee) => {
    // Deep clone employee so edits don't mutate state prematurely
    setEditingEmployee(JSON.parse(JSON.stringify(emp)));
    setEditActiveTab('general');
    setSaveSuccessMsg(null);
    setShowAddMovementFormInModal(false);
    setNewMovementForm({
      transferType: emp.transferType || 'Internal Transfer',
      employmentSource: emp.employmentSource || 'Transfer',
      previousDepartment: emp.department || '',
      newDepartment: emp.department || '',
      previousPosition: emp.jobTitle || '',
      newPosition: emp.jobTitle || '',
      effectiveDate: new Date().toISOString().split('T')[0],
      previousOrganisation: emp.previousOrganisation || 'PJPIIMC Central',
      reason: 'Operational rotation & clinical staffing realignment',
      approvingAuthority: 'Dr. Kwame Boateng (Chief Medical Officer)',
      referenceNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  const handleSaveEmployeeEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, editingEmployee);

    // If selectedEmployee was currently open, update its state as well
    if (selectedEmployee && selectedEmployee.id === editingEmployee.id) {
      setSelectedEmployee(editingEmployee);
    }

    setSaveSuccessMsg(`Successfully updated file for ${editingEmployee.firstName} ${editingEmployee.lastName}!`);
    showToast('success', 'Profile Updated', `Saved file changes for ${editingEmployee.firstName} ${editingEmployee.lastName}.`);
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setEditingEmployee(null);
    }, 1200);
  };

  // RECORD MOVEMENT INSIDE EDIT MODAL
  const handleAddMovementInEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const record: StaffMovementRecord = {
      id: `mov-${Date.now()}`,
      employeeId: editingEmployee.id,
      employeeName: `${editingEmployee.firstName} ${editingEmployee.lastName}`,
      empCode: editingEmployee.empCode,
      transferType: newMovementForm.transferType,
      employmentSource: newMovementForm.employmentSource,
      previousDepartment: newMovementForm.previousDepartment || editingEmployee.department,
      newDepartment: newMovementForm.newDepartment,
      previousPosition: newMovementForm.previousPosition || editingEmployee.jobTitle,
      newPosition: newMovementForm.newPosition,
      previousOrganisation: newMovementForm.previousOrganisation,
      effectiveDate: newMovementForm.effectiveDate,
      reason: newMovementForm.reason,
      approvingAuthority: newMovementForm.approvingAuthority,
      referenceNumber: newMovementForm.referenceNumber,
      recordedAt: new Date().toISOString(),
      recordedBy: 'HR Administration',
      status: 'Completed',
    };

    const updatedHistory = [record, ...(editingEmployee.movementHistory || [])];
    const updatedEmp: Employee = {
      ...editingEmployee,
      department: newMovementForm.newDepartment || editingEmployee.department,
      currentDepartment: newMovementForm.newDepartment || editingEmployee.department,
      jobTitle: newMovementForm.newPosition || editingEmployee.jobTitle,
      currentPosition: newMovementForm.newPosition || editingEmployee.jobTitle,
      transferType: newMovementForm.transferType,
      employmentSource: newMovementForm.employmentSource,
      previousDepartment: newMovementForm.previousDepartment,
      previousPosition: newMovementForm.previousPosition,
      previousOrganisation: newMovementForm.previousOrganisation,
      transferDate: newMovementForm.effectiveDate,
      transferReferenceNumber: newMovementForm.referenceNumber,
      movementHistory: updatedHistory,
    };

    setEditingEmployee(updatedEmp);
    recordStaffMovement(record);
    setShowAddMovementFormInModal(false);
    showToast('success', 'Movement History Recorded', `Logged movement for ${editingEmployee.firstName} to ${newMovementForm.newDepartment}`);
  };

  const handleRemoveMovementFromEdit = (movId: string) => {
    if (!editingEmployee) return;
    const filtered = (editingEmployee.movementHistory || []).filter((m) => m.id !== movId);
    setEditingEmployee({
      ...editingEmployee,
      movementHistory: filtered,
    });
    showToast('info', 'Movement Record Removed', 'Movement log removed from this employee profile.');
  };

  // PHOTO FILE UPLOAD HANDLER
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingEmployee) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setEditingEmployee({
          ...editingEmployee,
          photo: reader.result as string,
        });
        showToast('info', 'Photo Updated', 'Staff photo preview updated. Save changes to persist.');
      };
      reader.readAsDataURL(file);
    }
  };

  // APPOINTMENT LETTER UPLOAD
  const handleAppointmentLetterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingEmployee) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newDoc: OfficialDocument = {
          id: `doc-app-${Date.now()}`,
          title: 'Appointment Letter',
          type: 'Appointment Letter',
          fileUrl: dataUrl,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'HR Officer',
        };
        const existingDocs = editingEmployee.officialDocuments || [];
        setEditingEmployee({
          ...editingEmployee,
          appointmentLetterUrl: dataUrl,
          appointmentLetterName: file.name,
          officialDocuments: [newDoc, ...existingDocs.filter((d) => d.type !== 'Appointment Letter')],
        });
        showToast('success', 'Appointment Letter Uploaded', `Attached ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // ASSUMPTION OF DUTY LETTER UPLOAD
  const handleAssumptionOfDutyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingEmployee) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newDoc: OfficialDocument = {
          id: `doc-ass-${Date.now()}`,
          title: 'Assumption of Duty Letter',
          type: 'Assumption of Duty Letter',
          fileUrl: dataUrl,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'HR Officer',
        };
        const existingDocs = editingEmployee.officialDocuments || [];
        setEditingEmployee({
          ...editingEmployee,
          assumptionOfDutyUrl: dataUrl,
          assumptionOfDutyName: file.name,
          officialDocuments: [newDoc, ...existingDocs.filter((d) => d.type !== 'Assumption of Duty Letter')],
        });
        showToast('success', 'Assumption of Duty Letter Uploaded', `Attached ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // TRANSFER DOCUMENT UPLOAD
  const handleTransferDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingEmployee) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newDoc: OfficialDocument = {
          id: `doc-trf-${Date.now()}`,
          title: 'Transfer / Posting Document',
          type: 'Transfer Document',
          fileUrl: dataUrl,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'HR Officer',
        };
        const existingDocs = editingEmployee.officialDocuments || [];
        setEditingEmployee({
          ...editingEmployee,
          transferDocumentUrl: dataUrl,
          transferDocumentName: file.name,
          officialDocuments: [newDoc, ...existingDocs.filter((d) => d.type !== 'Transfer Document')],
        });
        showToast('success', 'Transfer Document Uploaded', `Attached ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // GHANA CARD FRONT & BACK SCANS UPLOAD
  const handleGhanaCardFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingEmployee) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const currCard = editingEmployee.ghanaCardInfo || {
          cardPin: editingEmployee.nationalId || 'GHA-000000000-0',
          verificationStatus: 'Verified',
        };
        setEditingEmployee({
          ...editingEmployee,
          nationalId: currCard.cardPin,
          ghanaCardInfo: {
            ...currCard,
            frontCopyUrl: dataUrl,
            frontCopyName: file.name,
          },
        });
        showToast('info', 'Ghana Card Front Scan Uploaded', `Attached ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGhanaCardBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingEmployee) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const currCard = editingEmployee.ghanaCardInfo || {
          cardPin: editingEmployee.nationalId || 'GHA-000000000-0',
          verificationStatus: 'Verified',
        };
        setEditingEmployee({
          ...editingEmployee,
          nationalId: currCard.cardPin,
          ghanaCardInfo: {
            ...currCard,
            backCopyUrl: dataUrl,
            backCopyName: file.name,
          },
        });
        showToast('info', 'Ghana Card Back Scan Uploaded', `Attached ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // EDUCATION CERTIFICATE FILE UPLOAD
  const handleEduCertFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setNewEduCertUrl(reader.result as string);
        setNewEduCertName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEducationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !newEduInst || !newEduQual) return;
    const item: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: newEduInst,
      qualification: newEduQual,
      fieldOfStudy: newEduField,
      startYear: newEduStartYear,
      graduationYear: newEduGradYear,
      gradeOrClass: newEduGrade,
      certificateUrl: newEduCertUrl || '#',
      certificateFileName: newEduCertName || 'Degree_Certificate.pdf',
    };

    const currentList = editingEmployee.educationList || [];
    setEditingEmployee({
      ...editingEmployee,
      educationList: [item, ...currentList],
      education: `${newEduQual}, ${newEduInst}`,
    });

    setNewEduInst('');
    setNewEduQual('');
    setNewEduField('');
    setNewEduStartYear('');
    setNewEduGradYear('');
    setNewEduGrade('');
    setNewEduCertUrl('');
    setNewEduCertName('');
    showToast('success', 'Education Background Added', `Added ${item.qualification}`);
  };

  const handleRemoveEducation = (eduId: string) => {
    if (!editingEmployee) return;
    const list = (editingEmployee.educationList || []).filter((e) => e.id !== eduId);
    setEditingEmployee({
      ...editingEmployee,
      educationList: list,
    });
  };

  // EMERGENCY CONTACTS HANDLERS
  const handleAddEmergencyContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !newContactName || !newContactPhone) return;
    const contact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: newContactName,
      relation: newContactRel,
      phone: newContactPhone,
      altPhone: newContactAltPhone,
      address: newContactAddress,
      email: newContactEmail,
    };

    const currentList = editingEmployee.emergencyContacts || [];
    setEditingEmployee({
      ...editingEmployee,
      emergencyContacts: [...currentList, contact],
    });

    setNewContactName('');
    setNewContactRel('Spouse');
    setNewContactPhone('');
    setNewContactAltPhone('');
    setNewContactAddress('');
    setNewContactEmail('');
    showToast('success', 'Emergency Contact Added', `Added ${contact.name}`);
  };

  const handleRemoveEmergencyContact = (index: number) => {
    if (!editingEmployee) return;
    const list = [...(editingEmployee.emergencyContacts || [])];
    list.splice(index, 1);
    setEditingEmployee({
      ...editingEmployee,
      emergencyContacts: list,
    });
  };

  // OFFICIAL DOC FILE UPLOAD HANDLER
  const handleNewDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setNewDocFileUrl(reader.result as string);
        setNewDocFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOfficialDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !newDocTitle || !newDocFileName) return;
    const newDoc: OfficialDocument = {
      id: `doc-custom-${Date.now()}`,
      title: newDocTitle,
      type: newDocType,
      fileUrl: newDocFileUrl || '#',
      fileName: newDocFileName,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'HR Officer',
      notes: newDocNotes,
    };

    const currentList = editingEmployee.officialDocuments || [];
    setEditingEmployee({
      ...editingEmployee,
      officialDocuments: [newDoc, ...currentList],
    });

    setNewDocTitle('');
    setNewDocType('Appointment Letter');
    setNewDocFileName('');
    setNewDocFileUrl('');
    setNewDocNotes('');
    showToast('success', 'Official Document Saved', `Added ${newDoc.title}`);
  };

  const handleRemoveOfficialDoc = (docId: string) => {
    if (!editingEmployee) return;
    const list = (editingEmployee.officialDocuments || []).filter((d) => d.id !== docId);
    setEditingEmployee({
      ...editingEmployee,
      officialDocuments: list,
    });
  };

  const handleAddLicenseToEdit = () => {
    if (!editingEmployee) return;
    const newLic: MedicalLicense = {
      id: `lic-edit-${Date.now()}`,
      licenseType: 'DHA Specialist License',
      licenseNumber: `LIC-DHA-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '2028-12-31',
      issuingAuthority: 'Dubai Health Authority',
      status: 'Active',
      verified: true,
    };

    setEditingEmployee({
      ...editingEmployee,
      medicalLicenses: [...editingEmployee.medicalLicenses, newLic],
    });
  };

  const handleRemoveLicenseFromEdit = (licId: string) => {
    if (!editingEmployee) return;
    setEditingEmployee({
      ...editingEmployee,
      medicalLicenses: (editingEmployee.medicalLicenses || []).filter((l) => l && l.id !== licId),
    });
  };

  const handleSingleAccountCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalAccountModalEmp) return;

    if (singlePasswordType === 'custom' && !singleCustomPassword.trim()) {
      showToast('error', 'Missing Password', 'Please enter a custom password or click Generate Strong Password.');
      return;
    }

    const empId = portalAccountModalEmp.id;
    const empName = `${portalAccountModalEmp.firstName} ${portalAccountModalEmp.lastName}`;
    const targetEmpObj = portalAccountModalEmp;
    setPortalAccountModalEmp(null);

    const result = await createEmployeePortalAccount(empId, {
      usernameType: singleUsernameType,
      passwordType: singlePasswordType,
      customPassword: singleCustomPassword.trim(),
      sendInviteEmail: singleSendEmailNotification,
      mustChangePassword: singleRequireChangeOnLogin,
    });

    if (singleSendSmsNotification && targetEmpObj.phone) {
      sendPortalInviteSms(empId).catch((err) => console.warn('SMS dispatch error:', err));
    }

    if (result.success) {
      setEmailDispatchModal(result);
      setEmailDispatchLog((prev) => [result, ...prev]);
      showToast('success', 'Portal Password Updated', `Portal login password successfully assigned to ${empName}.`);
    } else {
      showToast('success', 'Password Updated (Offline Slip)', `Password updated for ${empName}. Credential slip generated.`);
      setEmailDispatchModal(result);
    }
  };

  const handleToggleSelectAllBatch = () => {
    if (selectedStaffForBatch.length === filteredEmployees.length) {
      setSelectedStaffForBatch([]);
    } else {
      setSelectedStaffForBatch(filteredEmployees.map((e) => e.id));
    }
  };

  const handleToggleSelectStaff = (empId: string) => {
    if (selectedStaffForBatch.includes(empId)) {
      setSelectedStaffForBatch(selectedStaffForBatch.filter((id) => id !== empId));
    } else {
      setSelectedStaffForBatch([...selectedStaffForBatch, empId]);
    }
  };

  const handleRunBatchPortalInvites = async () => {
    if (selectedStaffForBatch.length === 0) return;

    showToast('info', 'Processing Batch Invites', `Sending credential emails to ${selectedStaffForBatch.length} staff members...`);

    const results = await batchCreateAndInvitePortalAccounts(selectedStaffForBatch, {
      usernameType: batchUsernameType,
      passwordType: batchPasswordType,
    });

    setSelectedStaffForBatch([]);
    setEmailDispatchLog((prev) => [...results, ...prev]);

    const successCount = results.filter((r) => r.success).length;
    showToast('success', 'Batch Dispatched Complete', `Emailed credentials to ${successCount} / ${results.length} staff members.`);

    if (results.length > 0 && results[0].success) {
      setEmailDispatchModal(results[0]);
    }
  };

  const handleCopyCredentials = (emp: Employee) => {
    const username = emp.portalAccess?.username || (emp.email ? emp.email : emp.empCode);
    const password = emp.portalAccess?.tempPassword || emp.empCode;
    const text = `AuraHR Employee Portal Logins\nName: ${emp.firstName} ${emp.lastName}\nStaff ID: ${emp.empCode}\nPortal URL: https://aurahr.health/login\nUsername (${emp.portalAccess?.usernameType || 'email'}): ${username}\nTemporary Password: ${password}`;

    navigator.clipboard.writeText(text);
    setCopiedCredEmpId(emp.id);
    setTimeout(() => setCopiedCredEmpId(null), 2500);
  };

  const toggleShowPassword = (empId: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [empId]: !prev[empId] }));
  };

  const handleEnrollHeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollHeadForm.firstName.trim() || !enrollHeadForm.lastName.trim()) {
      showToast('error', 'Missing Information', 'Please provide both First Name and Last Name.');
      return;
    }
    setIsEnrollingHead(true);
    try {
      const created = await enrollHeadOfFacility({
        firstName: enrollHeadForm.firstName.trim(),
        lastName: enrollHeadForm.lastName.trim(),
        gender: enrollHeadForm.gender,
        empCode: enrollHeadForm.empCode.trim() || 'EMP-3522',
        email: enrollHeadForm.email.trim() || `${enrollHeadForm.firstName.trim().toLowerCase()}.${enrollHeadForm.lastName.trim().toLowerCase()}@pjpiimc.org`,
        phone: enrollHeadForm.phone.trim(),
        password: enrollHeadForm.password.trim() || enrollHeadForm.empCode.trim() || 'EMP-3522',
        jobTitle: enrollHeadForm.jobTitle.trim() || 'Head of Facility / Chief Executive Officer',
        department: 'Executive Administration',
      });
      setIsEnrollHeadModalOpen(false);
      showToast('success', 'Enrolled Head of Facility', `Successfully enrolled ${created.firstName} ${created.lastName} (${created.empCode}) as Head of Facility.`);
    } catch (err: any) {
      showToast('error', 'Enrollment Failed', err.message || 'Failed to enroll Head of Facility.');
    } finally {
      setIsEnrollingHead(false);
    }
  };

  const handleEnrollHrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollHrForm.firstName.trim() || !enrollHrForm.lastName.trim()) {
      showToast('error', 'Missing Information', 'Please provide both First Name and Last Name.');
      return;
    }
    setIsEnrollingHr(true);
    try {
      const code = enrollHrForm.empCode.trim() || (enrollHrForm.role === 'hr_director' ? 'EMP-1976' : 'EMP-2044');
      const pass = enrollHrForm.password.trim() || code;
      const email = enrollHrForm.email.trim() || `${enrollHrForm.firstName.trim().toLowerCase()}.${enrollHrForm.lastName.trim().toLowerCase()}@pjpiimc.org`;
      const title = enrollHrForm.jobTitle.trim() || (enrollHrForm.role === 'hr_director' ? 'Director of Human Resources' : 'Hospital HR Operations Manager');

      const created = await enrollHrLeader({
        firstName: enrollHrForm.firstName.trim(),
        lastName: enrollHrForm.lastName.trim(),
        gender: enrollHrForm.gender,
        role: enrollHrForm.role,
        empCode: code,
        email: email,
        phone: enrollHrForm.phone.trim(),
        password: pass,
        jobTitle: title,
        department: 'Human Resources',
      });
      setIsEnrollHrModalOpen(false);
      showToast('success', 'Enrolled HR Leader', `Successfully enrolled ${created.firstName} ${created.lastName} (${created.empCode}) as ${created.role === 'hr_director' ? 'HR Director' : 'HR Manager'}.`);
    } catch (err: any) {
      showToast('error', 'Enrollment Failed', err.message || 'Failed to enroll HR Leader.');
    } finally {
      setIsEnrollingHr(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Staff Action / Deletion / Addition Real-Time Feedback Banner */}
      {lastStaffAction && (
        <div
          id="banner-last-staff-action"
          className={`rounded-2xl p-4 border shadow-xl flex items-center justify-between gap-4 transition-all duration-300 ${
            lastStaffAction.type === 'added'
              ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900/40 border-emerald-500/50 text-emerald-100'
              : lastStaffAction.type === 'deleted'
              ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900/40 border-rose-500/50 text-rose-100'
              : 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900/40 border-amber-500/50 text-amber-100'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-inner ${
                lastStaffAction.type === 'added'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : lastStaffAction.type === 'deleted'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
            >
              {lastStaffAction.type === 'added' ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : lastStaffAction.type === 'deleted' ? (
                <Trash2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    lastStaffAction.type === 'added'
                      ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50'
                      : lastStaffAction.type === 'deleted'
                      ? 'bg-rose-500/30 text-rose-300 border-rose-400/50'
                      : 'bg-amber-500/30 text-amber-300 border-amber-400/50'
                  }`}
                >
                  {lastStaffAction.type === 'added'
                    ? 'Staff Successfully Added'
                    : lastStaffAction.type === 'deleted'
                    ? 'Staff Successfully Deleted'
                    : 'Staff Registry Reset'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(lastStaffAction.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Cloud Synced
                </span>
              </div>
              <p className="text-sm font-medium mt-1 text-slate-200">
                {lastStaffAction.message}
              </p>
            </div>
          </div>

          <button
            onClick={clearLastStaffAction}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition shrink-0"
            title="Dismiss Notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 border border-slate-800 text-white shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Healthcare Staff Directory & HR File Management
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Pencil className="h-3 w-3" /> HR Edit Access Enabled
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 max-w-3xl">
                HR administrators have full access to add, edit, or delete staff members, manage departments, update medical licenses, and synchronize records automatically in real-time across the hospital system.
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge & Cloud Sync Status */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-500">Total Staff:</span>
              <strong className="text-white font-bold">{employees.length}</strong>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-500">Departments:</span>
              <strong className="text-amber-300 font-bold">{departmentLeadership.length}</strong>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400" title="Automated Real-Time Cloud Synchronization active">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold">Cloud Synced</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs and Actions Bar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Navigation Items (Tabs) */}
          <nav className="flex items-center overflow-x-auto p-1.5 bg-slate-950 rounded-xl border border-slate-800 scrollbar-thin gap-1">
            <button
              id="tab-staff-profiles"
              onClick={() => setActiveView('directory')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeView === 'directory'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="h-4 w-4 text-emerald-400" />
              <span>Staff Profiles & Files</span>
            </button>

            <button
              id="tab-portal-logins"
              onClick={() => setActiveView('portal_accounts')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeView === 'portal_accounts'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Key className="h-4 w-4 text-indigo-400" />
              <span>Portal Logins & Invites</span>
            </button>

            <button
              id="tab-dept-leadership"
              onClick={() => setActiveView('leadership')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeView === 'leadership'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span>Department & Unit Leadership</span>
            </button>

            <button
              id="tab-promotions-tracking"
              onClick={() => setActiveView('promotions')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeView === 'promotions'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span>Promotion Tracking (3y/5y)</span>
            </button>

            <button
              id="tab-transfers-history"
              onClick={() => setActiveView('transfers')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeView === 'transfers'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ArrowRightLeft className="h-4 w-4 text-teal-400" />
              <span>Staff Transfers & Movement History</span>
            </button>

            <button
              id="tab-org-hierarchy"
              onClick={() => setActiveView('hierarchy')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeView === 'hierarchy'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GitFork className="h-4 w-4 text-emerald-400" />
              <span>Org Hierarchy Tree</span>
            </button>
          </nav>

          {/* Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="btn-add-department"
              onClick={() => setActiveView('leadership')}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-white shadow transition active:scale-95 border border-slate-700 whitespace-nowrap"
              title="Open Department & Unit Leadership to manage or add departments"
            >
              <Building2 className="h-4 w-4 text-amber-300" />
              <span>(ADD DEPARTMENT)</span>
            </button>

            <button
              id="btn-provision-staff-account"
              onClick={() => setIsCreateHrAccountModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 shadow transition active:scale-95 border border-slate-700 whitespace-nowrap"
              title="Provision staff self-service portal credentials with HR controls"
            >
              <Key className="h-4 w-4 text-emerald-400" />
              <span>Provision Staff Portal</span>
            </button>

            {employees.length > 0 && canEnrollLeadership && (
              <button
                id="btn-delete-all-staff-modal"
                onClick={() => setIsDeleteAllStaffModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3.5 py-2 text-xs font-bold shadow transition active:scale-95 whitespace-nowrap"
                title="Delete all staff members to start fresh"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All Staff</span>
              </button>
            )}

            <button
              id="btn-add-staff-profile"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition active:scale-95 border border-emerald-400/30 whitespace-nowrap"
              title="Create a new comprehensive healthcare employee profile"
            >
              <Plus className="h-4 w-4 text-emerald-200" />
              <span>Add Staff Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 2: DEDICATED EMPLOYEE PORTAL ACCOUNTS & LOGINS MANAGER */}
      {activeView === 'portal_accounts' && (
        <div className="space-y-6">
          {/* Quick Explanation & Batch Bar */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  Portal Account Login Conventions & Invitation Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                  Configure employee portal access credentials. HR can set the login username to either <strong className="text-indigo-300">Work Email</strong> or <strong className="text-emerald-300">Staff ID (e.g. DOC-1001 / NUR-2004)</strong>. Initial temporary passwords default to their Staff ID or Email.
                </p>
              </div>

              {/* Batch Actions Button */}
              {selectedStaffForBatch.length > 0 && (
                <div className="flex items-center gap-2 bg-indigo-950/80 p-2.5 rounded-xl border border-indigo-500/40">
                  <span className="text-xs font-bold text-indigo-200">
                    {selectedStaffForBatch.length} Selected
                  </span>
                  <button
                    onClick={handleRunBatchPortalInvites}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition shadow flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Batch Send Portal Invites
                  </button>
                </div>
              )}
            </div>

            {/* Batch Controls Configuration Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">USERNAME CONVENTION</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="batchUsername"
                      checked={batchUsernameType === 'email'}
                      onChange={() => setBatchUsernameType('email')}
                      className="text-indigo-600"
                    />
                    Work Email Address
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="batchUsername"
                      checked={batchUsernameType === 'empCode'}
                      onChange={() => setBatchUsernameType('empCode')}
                      className="text-indigo-600"
                    />
                    Staff ID Code
                  </label>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">INITIAL PASSWORD CONVENTION</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="batchPassword"
                      checked={batchPasswordType === 'empCode'}
                      onChange={() => setBatchPasswordType('empCode')}
                      className="text-indigo-600"
                    />
                    Staff ID Code (Recommended)
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="batchPassword"
                      checked={batchPasswordType === 'email'}
                      onChange={() => setBatchPasswordType('email')}
                      className="text-indigo-600"
                    />
                    Work Email Address
                  </label>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">BULK SELECTION</span>
                  <span className="text-slate-300 text-xs">Select all listed staff</span>
                </div>
                <button
                  onClick={handleToggleSelectAllBatch}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-indigo-300 font-bold hover:bg-slate-700"
                >
                  {selectedStaffForBatch.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
          </div>

          {/* Table of Employee Portal Logins */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedStaffForBatch.length === filteredEmployees.length && filteredEmployees.length > 0}
                        onChange={handleToggleSelectAllBatch}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                      />
                    </th>
                    <th className="p-4">Employee / Staff Member</th>
                    <th className="p-4">Staff ID (Emp Code)</th>
                    <th className="p-4">Portal Username</th>
                    <th className="p-4">Temp Initial Password</th>
                    <th className="p-4">Invitation Status</th>
                    <th className="p-4 text-right">HR Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEmployees.map((emp) => {
                    const portal = emp.portalAccess;
                    const username = portal?.username || emp.email;
                    const tempPassword = portal?.tempPassword || emp.empCode;
                    const inviteStatus = portal?.inviteStatus || 'Invitation Sent';
                    const isSelected = selectedStaffForBatch.includes(emp.id);
                    const showPass = showPasswordMap[emp.id] || false;

                    return (
                      <tr
                        key={emp.id}
                        className={`hover:bg-slate-800/50 transition ${
                          isSelected ? 'bg-indigo-950/30' : ''
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStaff(emp.id)}
                            className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setPhotoModalEmp(emp)}
                              className="relative group focus:outline-none shrink-0"
                              title="Click to update staff photo"
                            >
                              <img
                                src={emp.photo}
                                alt={emp.firstName}
                                className="h-10 w-10 rounded-xl object-cover border border-slate-700 transition group-hover:opacity-75"
                              />
                              <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition">
                                <Camera className="h-4 w-4 text-emerald-400" />
                              </span>
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white">
                                  {emp.firstName} {emp.lastName}
                                </p>
                                {emp.gender && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                    emp.gender === 'Female'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : emp.gender === 'Male'
                                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  }`}>
                                    {emp.gender === 'Female' ? '♀ Female' : emp.gender === 'Male' ? '♂ Male' : '⚧ Other'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {emp.jobTitle} • {emp.department}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-bold">
                            {emp.empCode}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="font-medium text-slate-200 flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-indigo-400" /> {username}
                            </p>
                            <span className="text-[9px] text-slate-500 capitalize">
                              Type: {portal?.usernameType || 'Work Email'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {emp.customPassword || portal?.customPassword ? (
                              <span className="font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/60 font-bold text-xs flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                {showPass ? (emp.customPassword || portal?.customPassword) : '••••••••'}
                              </span>
                            ) : (
                              <span className="font-mono text-amber-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-bold text-xs">
                                {showPass ? tempPassword : '••••••••'}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(emp.id)}
                              className="text-slate-500 hover:text-white p-1"
                              title="Toggle View Password"
                            >
                              {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPortalAccountModalEmp(emp);
                                setSingleUsernameType(emp.portalAccess?.usernameType || 'email');
                                setSinglePasswordType(emp.customPassword || emp.portalAccess?.customPassword ? 'custom' : 'empCode');
                                setSingleCustomPassword(emp.customPassword || emp.portalAccess?.customPassword || '');
                                setShowSingleCustomPassword(false);
                                setSingleRequireChangeOnLogin(emp.portalAccess?.mustChangePassword ?? true);
                                setSingleSendEmailNotification(!!emp.email);
                                setSingleSendSmsNotification(!!emp.phone);
                              }}
                              className="text-amber-400 hover:text-amber-300 p-1 transition"
                              title="Change / Set New Password"
                            >
                              <Key className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              inviteStatus === 'Portal Activated'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : inviteStatus === 'Invitation Sent'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {inviteStatus}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setPortalAccountModalEmp(emp);
                                setSingleUsernameType(emp.portalAccess?.usernameType || 'email');
                                setSinglePasswordType(emp.customPassword || emp.portalAccess?.customPassword ? 'custom' : 'empCode');
                                setSingleCustomPassword(emp.customPassword || emp.portalAccess?.customPassword || '');
                                setShowSingleCustomPassword(false);
                                setSingleRequireChangeOnLogin(emp.portalAccess?.mustChangePassword ?? true);
                                setSingleSendEmailNotification(!!emp.email);
                                setSingleSendSmsNotification(!!emp.phone);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] transition flex items-center gap-1 shadow-sm"
                              title="Set or Change Staff Portal Password"
                            >
                              <Key className="h-3 w-3" /> Change Password
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(emp)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/80 text-white font-bold text-[11px] hover:bg-emerald-500 transition flex items-center gap-1"
                              title="Edit Full Employee Record & File"
                            >
                              <Pencil className="h-3 w-3" /> Edit Profile
                            </button>

                            <button
                              onClick={() => handleTriggerSendInvite(emp.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/80 text-white font-bold text-[11px] hover:bg-indigo-500 transition flex items-center gap-1"
                              title="Resend Email Invitation with Login Credentials"
                            >
                              <Send className="h-3 w-3" /> Email
                            </button>

                            <button
                              onClick={() => handleTriggerSendSmsInvite(emp.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/80 text-white font-bold text-[11px] hover:bg-emerald-500 transition flex items-center gap-1"
                              title="Send Credentials via Cellular SMS"
                            >
                              <Phone className="h-3 w-3" /> SMS
                            </button>

                            <button
                              onClick={() => handleCopyCredentials(emp)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                              title="Copy Credentials Slip"
                            >
                              {copiedCredEmpId === emp.id ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              onClick={() => setStaffToDelete(emp)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition border border-rose-500/20"
                              title="Delete Staff Member from System"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DEPARTMENT & UNIT LEADERSHIP GOVERNANCE */}
      {activeView === 'leadership' && <DepartmentLeadershipManager />}

      {/* VIEW 4: ORGANIZATIONAL HIERARCHY TREE */}
      {activeView === 'hierarchy' && <OrgHierarchyView />}

      {/* VIEW 5: STAFF PROMOTION TRACKING DASHBOARD & ELIGIBILITY FORECASTING */}
      {activeView === 'promotions' && (
        <PromotionTrackingDashboard onSelectEmployee={(emp) => setSelectedEmployee(emp)} />
      )}

      {/* VIEW 6: STAFF TRANSFERS & MOVEMENT REGISTRY */}
      {activeView === 'transfers' && (
        <StaffTransferRegistry
          onSelectEmployee={(emp) => setSelectedEmployee(emp)}
          onEditEmployee={(emp) => handleOpenEditModal(emp)}
        />
      )}

      {/* VIEW 1: STANDARD DIRECTORY CARDS VIEW */}
      {activeView === 'directory' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, code (DOC-1001), previous organisation, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Departments</option>
                  {(departmentLeadership || []).map((dept) => (
                    <option key={dept.departmentName} value={dept.departmentName}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title="Filter by Employment Induction Source"
              >
                <option value="All">All Employment Sources</option>
                <option value="New Hire">New Hire</option>
                <option value="Transfer">Transfer</option>
                <option value="Promotion">Promotion</option>
                <option value="Reappointment">Reappointment</option>
                <option value="National Service">National Service</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={transferTypeFilter}
                onChange={(e) => setTransferTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                title="Filter by Transfer Classification"
              >
                <option value="All">All Transfer Types</option>
                <option value="Internal Transfer">Internal Transfer</option>
                <option value="External Transfer">External Transfer</option>
                <option value="Departmental Redeployment">Redeployment</option>
              </select>

              <select
                value={mechanisationFilter}
                onChange={(e) => setMechanisationFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold"
                title="Filter by Payroll Mechanisation Group (GoG vs Hospital IGF)"
              >
                <option value="All">All Payroll Groups</option>
                <option value="Mechanised">🇬🇭 Mechanised (GoG Paid)</option>
                <option value="Non-Mechanised">🏥 Non-Mechanised (Hospital Paid)</option>
              </select>

              <select
                value={inviteStatusFilter}
                onChange={(e) => setInviteStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Portal Statuses</option>
                <option value="Sent">Invitation Sent</option>
                <option value="Activated">Portal Activated</option>
                <option value="Not Invited">Not Invited</option>
              </select>
            </div>
          </div>

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((emp) => {
              const activeLicenses = (emp.medicalLicenses || []).filter((l) => l && l.status === 'Active').length;
              const expiringLicenses = (emp.medicalLicenses || []).filter(
                (l) => l && (l.status === 'Expiring Soon' || l.status === 'Expired')
              ).length;
              const portalUsername = emp.portalAccess?.username || emp.email;

              return (
                <div
                  key={emp.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPhotoModalEmp(emp)}
                          className="relative group focus:outline-none shrink-0"
                          title="Click to update staff photo"
                        >
                          <img
                            src={emp.photo}
                            alt={emp.firstName}
                            className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500/20 transition group-hover:opacity-75"
                          />
                          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition">
                            <Camera className="h-4 w-4 text-emerald-400" />
                          </span>
                        </button>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {emp.firstName} {emp.lastName}
                          </h3>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {emp.jobTitle}
                          </p>
                          <p className="text-[10px] text-slate-400">{emp.department}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {emp.empCode}
                        </span>
                        {emp.gender && (
                          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold border ${
                            emp.gender === 'Female'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : emp.gender === 'Male'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                          }`}>
                            {emp.gender === 'Female' ? '♀ Female' : emp.gender === 'Male' ? '♂ Male' : '⚧ Other'}
                          </span>
                        )}
                        {emp.employmentSource === 'Transfer' ? (
                          <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <ArrowRightLeft className="h-3 w-3" /> {emp.transferType || 'Transfer'}
                          </span>
                        ) : emp.employmentSource && emp.employmentSource !== 'New Hire' ? (
                          <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {emp.employmentSource}
                          </span>
                        ) : null}

                        {/* Mechanisation Status Group Badge */}
                        <span
                          className={`rounded-lg px-2 py-0.5 text-[9px] font-bold border flex items-center gap-1 ${
                            (emp.mechanisationStatus || (emp.employmentType === 'Contract' || (emp.employmentType as any) === 'Locum' ? 'Non-Mechanised' : 'Mechanised')) === 'Mechanised'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                          title={
                            (emp.mechanisationStatus || (emp.employmentType === 'Contract' || (emp.employmentType as any) === 'Locum' ? 'Non-Mechanised' : 'Mechanised')) === 'Mechanised'
                              ? 'Ghana Government Mechanised Payroll (CAGD Subvention)'
                              : 'Hospital Paid (Direct IGF Liability)'
                          }
                        >
                          <span>
                            {(emp.mechanisationStatus || (emp.employmentType === 'Contract' || (emp.employmentType as any) === 'Locum' ? 'Non-Mechanised' : 'Mechanised')) === 'Mechanised'
                              ? '🇬🇭'
                              : '🏥'}
                          </span>
                          {(emp.mechanisationStatus || (emp.employmentType === 'Contract' || (emp.employmentType as any) === 'Locum' ? 'Non-Mechanised' : 'Mechanised')) === 'Mechanised'
                            ? 'Mechanised (GoG)'
                            : 'Non-Mechanised (IGF)'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{emp.phone}</span>
                      </div>
                      {emp.previousOrganisation && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <Building2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            Prev: <strong className="text-slate-700 dark:text-slate-200">{emp.previousOrganisation}</strong> ({emp.previousPosition || emp.previousDepartment})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Portal Login Credentials Info Box */}
                    <div className="mt-3 rounded-xl bg-indigo-950/30 p-2.5 border border-indigo-500/20 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 flex items-center gap-1">
                          <Key className="h-3 w-3 text-indigo-400" /> Portal Username:
                        </span>
                        <span className="font-mono font-bold text-emerald-400 truncate max-w-[140px]">
                          {portalUsername}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Password (Initial):</span>
                        <span className="font-mono text-amber-300 font-bold">
                          {emp.portalAccess?.tempPassword || emp.empCode}
                        </span>
                      </div>
                    </div>

                    {/* Licenses Summary */}
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2 text-[11px] dark:bg-slate-800/60">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Award className="h-3.5 w-3.5 text-emerald-500" /> Medical Licenses:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">{activeLicenses} Active</span>
                        {expiringLicenses > 0 && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                            {expiringLicenses} Expiring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Digital File <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(emp)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-600/20 transition flex items-center gap-1 border border-emerald-500/20"
                        title="Edit Employee Details & Digital File"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit Details
                      </button>

                      <button
                        onClick={() => {
                          setPortalAccountModalEmp(emp);
                          setSingleUsernameType(emp.portalAccess?.usernameType || 'email');
                          setSinglePasswordType(emp.customPassword || emp.portalAccess?.customPassword ? 'custom' : 'empCode');
                          setSingleCustomPassword(emp.customPassword || emp.portalAccess?.customPassword || '');
                          setShowSingleCustomPassword(false);
                          setSingleRequireChangeOnLogin(emp.portalAccess?.mustChangePassword ?? true);
                          setSingleSendEmailNotification(!!emp.email);
                          setSingleSendSmsNotification(!!emp.phone);
                        }}
                        className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition border border-amber-500/30"
                        title="Set or Change Staff Portal Password"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleTriggerSendInvite(emp.id)}
                        className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition"
                        title="Resend Portal Login Invite"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setStaffToDelete(emp)}
                        title="Remove Staff from System"
                        id={`btn-delete-staff-${emp.id}`}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition border border-rose-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State when no employees found / database cleared */}
          {filteredEmployees.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/60 p-8 sm:p-12 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Crown className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-white">
                  Staff Registry is Fresh & Ready
                </h3>
                <p className="text-xs text-slate-400">
                  No staff members currently in the directory. You can self-enroll as the Head of Facility to establish executive governance, or add staff profiles.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  id="btn-enroll-head-empty-state"
                  onClick={() => setIsEnrollHeadModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  <span>Enroll as Head of Facility</span>
                </button>
                <button
                  type="button"
                  id="btn-add-staff-empty-state"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Staff Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE DETAILS & DIGITAL FILE (CRITICAL HR EDIT ACCESS) */}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={(updated) => {
            updateEmployee(updated.id, updated);
            showToast("success", "Profile Updated", "Updated profile for " + updated.firstName + " " + updated.lastName);
          }}
          onDelete={(emp) => {
            setEditingEmployee(null);
            setStaffToDelete(emp);
          }}
          staffFiles={staffFiles}
          uploadStaffFile={uploadStaffFile}
          recordStaffMovement={recordStaffMovement}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Digital Employee Profile File Modal */}
      {selectedEmployee && (
        <DigitalStaffFileModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onEdit={(emp) => {
            setSelectedEmployee(null);
            setEditingEmployee(emp);
          }}
          onDelete={(emp) => {
            setSelectedEmployee(null);
            setStaffToDelete(emp);
          }}
          staffFiles={staffFiles}
          toggleStaffFilePermission={toggleStaffFilePermission}
          deleteStaffFile={deleteStaffFile}
          handleTriggerSendInvite={handleTriggerSendInvite}
          handleTriggerSendSmsInvite={handleTriggerSendSmsInvite}
          formatCurrency={formatCurrency}
          onUpdateEmployee={(updated) => {
            updateEmployee(updated.id, updated);
          }}
          onOpenChangePassword={(emp) => {
            setSelectedEmployee(null);
            setPortalAccountModalEmp(emp);
            setSingleUsernameType(emp.portalAccess?.usernameType || 'email');
            setSinglePasswordType(emp.customPassword || emp.portalAccess?.customPassword ? 'custom' : 'empCode');
            setSingleCustomPassword(emp.customPassword || emp.portalAccess?.customPassword || '');
            setShowSingleCustomPassword(false);
            setSingleRequireChangeOnLogin(emp.portalAccess?.mustChangePassword ?? true);
            setSingleSendEmailNotification(!!emp.email);
            setSingleSendSmsNotification(!!emp.phone);
          }}
        />
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" /> Create Staff Profile & Portal Login
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Photo Upload & Preview */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <EmployeePhotoUploader
                  currentPhoto={newEmp.photo}
                  employeeName={newEmp.firstName ? `${newEmp.firstName} ${newEmp.lastName}` : 'New Staff'}
                  gender={newEmp.gender}
                  onPhotoChange={(photo) => setNewEmp((prev) => ({ ...prev, photo }))}
                  title="Staff Photo (Optional)"
                  subtitle="Upload image, take camera snapshot, or select clinical preset"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                    className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                    className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Gender Designation Selection */}
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">
                    Gender Designation *
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    newEmp.gender === 'Female'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : newEmp.gender === 'Male'
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                  }`}>
                    {newEmp.gender === 'Female' ? '♀ Female Staff' : newEmp.gender === 'Male' ? '♂ Male Staff' : '⚧ Other / Non-Binary'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Female', 'Male', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewEmp({ ...newEmp, gender: g })}
                      className={`py-2 px-2 rounded-lg font-bold text-xs transition border flex items-center justify-center gap-1 ${
                        newEmp.gender === g
                          ? g === 'Female'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/50 shadow-sm'
                            : g === 'Male'
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/50 shadow-sm'
                            : 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/50 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      <span>{g === 'Female' ? '♀ Female' : g === 'Male' ? '♂ Male' : '⚧ Other'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newEmp.phone}
                  onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                  className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newEmp.jobTitle}
                    onChange={(e) => setNewEmp({ ...newEmp, jobTitle: e.target.value })}
                    className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <select
                    value={newEmp.department || departmentLeadership[0]?.departmentName || ''}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                  >
                    {(departmentLeadership || []).map((dept) => (
                      <option key={dept.departmentName} value={dept.departmentName}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Portal Login Options Box */}
              <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/30 space-y-2">
                <span className="font-bold text-indigo-400 text-[11px] flex items-center gap-1">
                  <Key className="h-3.5 w-3.5" /> Portal Login Credential Defaults
                </span>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-semibold">Username Login</span>
                    <select
                      value={newEmp.usernameType}
                      onChange={(e) => setNewEmp({ ...newEmp, usernameType: e.target.value as any })}
                      className="w-full rounded border p-1 dark:bg-slate-800 dark:border-slate-700 font-bold text-emerald-400"
                    >
                      <option value="email">Email Address</option>
                      <option value="empCode">Staff ID (Auto-Generated)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-semibold font-mono">Password Login</span>
                    <select
                      value={newEmp.passwordType}
                      onChange={(e) => setNewEmp({ ...newEmp, passwordType: e.target.value as any })}
                      className="w-full rounded border p-1 dark:bg-slate-800 dark:border-slate-700 font-bold text-amber-300"
                    >
                      <option value="empCode">Staff ID Code</option>
                      <option value="email">Email Address</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Staff Payroll Classification (Ghana Govt vs Hospital) */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">
                  Payroll Classification Group *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewEmp({ ...newEmp, mechanisationStatus: 'Mechanised' })}
                    className={`p-2 rounded-lg border text-left transition ${
                      newEmp.mechanisationStatus === 'Mechanised'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px]">
                      <span>🇬🇭</span> Mechanised (GoG)
                    </div>
                    <div className="text-[9px] opacity-75 font-normal">Salary: Ghana Government</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewEmp({ ...newEmp, mechanisationStatus: 'Non-Mechanised' })}
                    className={`p-2 rounded-lg border text-left transition ${
                      newEmp.mechanisationStatus === 'Non-Mechanised'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px]">
                      <span>🏥</span> Non-Mechanised (IGF)
                    </div>
                    <div className="text-[9px] opacity-75 font-normal">Salary: Hospital Paid</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Monthly Salary</label>
                <input
                  type="number"
                  required
                  value={newEmp.salary}
                  onChange={(e) => setNewEmp({ ...newEmp, salary: Number(e.target.value) })}
                  className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow"
                >
                  Save & Dispatch Portal Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Employee Photo Upload / Camera Modal */}
      {photoModalEmp && (
        <EmployeePhotoModal
          isOpen={!!photoModalEmp}
          employee={photoModalEmp}
          onClose={() => setPhotoModalEmp(null)}
          onSavePhoto={(newPhoto) => {
            updateEmployeePhoto(photoModalEmp.id, newPhoto);
            setPhotoModalEmp(null);
          }}
        />
      )}

      {/* FLOATING TOAST NOTIFICATION BANNER */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
          )}
          <div>
            <p className="font-bold text-sm text-white">{toast.title}</p>
            <p className="text-[11px] opacity-90">{toast.desc}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-3 text-slate-400 hover:text-white transition text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* MODAL: EMAIL DISPATCH CONFIRMATION & LIVE PREVIEW */}
      {emailDispatchModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl p-6 space-y-5">
            {/* Header Status */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      emailDispatchModal.channel === 'SMS'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      <CheckCircle2 className="h-3 w-3" /> {emailDispatchModal.channel === 'SMS' ? 'Cellular SMS Dispatched' : 'SMTP Email Dispatched'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {emailDispatchModal.dispatchId}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">
                    Staff Login Credentials Delivered
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setEmailDispatchModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Recipient & Organization Sender Header */}
            <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">ORGANIZATION SENDER</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-emerald-400 font-bold">
                    {emailDispatchModal.senderName || 'AuraHR Healthcare System'} &lt;{emailDispatchModal.senderEmail || 'hr@aurahr.health'}&gt;
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ Verified Org Domain
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">RECIPIENT EMAIL</span>
                <span className="font-mono text-cyan-300 font-bold">{emailDispatchModal.recipientEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">STAFF MEMBER</span>
                <span className="font-bold text-slate-200">{emailDispatchModal.recipientName}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-400 font-bold uppercase text-[10px]">EMAIL SUBJECT</span>
                <span className="font-medium text-slate-300 truncate max-w-[360px]">{emailDispatchModal.subject}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-900/90 p-2 rounded-xl">
                <span>Relay: {emailDispatchModal.smtpServer || 'mail.aurahr.health (TLS/587)'}</span>
                <span className="text-emerald-400">DKIM: PASS | SPF: PASS</span>
              </div>
            </div>

            {/* Formatted HTML Email Body Preview */}
            <div className="rounded-2xl bg-slate-950 p-5 border border-indigo-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-200 block">AuraHR Healthcare System</span>
                    <span className="text-[10px] text-slate-400">From: hr@aurahr.health (Official HR Dispatch)</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(emailDispatchModal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Dear <strong className="text-white">{emailDispatchModal.recipientName}</strong>,
              </p>

              <p className="text-xs text-slate-300 leading-relaxed">
                Your official hospital employee portal access account has been generated. Please find your secure single-sign-on login credentials below:
              </p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">PORTAL USERNAME</span>
                  <span className="font-mono text-emerald-400 font-bold text-xs mt-0.5 block">{emailDispatchModal.username}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">TEMPORARY INITIAL PASSWORD</span>
                  <span className="font-mono text-amber-300 font-bold text-xs mt-0.5 block">{emailDispatchModal.tempPassword}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 flex items-center justify-between">
                <span>Access Portal: <strong className="font-mono text-white">https://aurahr.health/login</strong></span>
                <span className="text-[10px] text-indigo-400 font-semibold">Change Password on First Login Required</span>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Notice: Confidential healthcare communication. If received in error, notify AuraHR Cyber Security.
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const copyText = `AuraHR Employee Credentials\nName: ${emailDispatchModal.recipientName}\nEmail: ${emailDispatchModal.recipientEmail}\nUsername: ${emailDispatchModal.username}\nTemp Password: ${emailDispatchModal.tempPassword}\nPortal: https://aurahr.health/login`;
                  navigator.clipboard.writeText(copyText);
                  showToast('success', 'Copied to Clipboard', 'Credentials copied to clipboard!');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Copy className="h-4 w-4 text-emerald-400" /> Copy Credentials Slip
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    showToast('info', 'Dispatching SMS...', `Sending credentials via SMS to staff member`);
                    const empObj = employees.find((e) => e.email === emailDispatchModal.recipientEmail || e.portalAccess?.username === emailDispatchModal.username);
                    if (empObj) {
                      const res = await sendPortalInviteSms(empObj.id);
                      if (res.success) {
                        setEmailDispatchModal(res);
                        showToast('success', 'Dispatched SMS', 'Credentials sent via cellular SMS!');
                      }
                    } else {
                      showToast('error', 'Employee Not Found', 'Could not locate employee record for SMS dispatch.');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Phone className="h-4 w-4" /> Send via SMS
                </button>

                <button
                  onClick={async () => {
                    showToast('info', 'Re-dispatching...', `Re-sending email to ${emailDispatchModal.recipientEmail}`);
                    const res = await sendPortalInviteEmail(emailDispatchModal.username);
                    if (res.success) {
                      setEmailDispatchModal(res);
                      showToast('success', 'Re-dispatched Email', 'Email sent successfully via SMTP!');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RefreshCw className="h-4 w-4" /> Resend Email
                </button>

                <button
                  onClick={() => setEmailDispatchModal(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROMPT FOR MISSING WORK EMAIL */}
      {missingEmailModalEmp && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-bold text-sm text-slate-100">Missing Email Address</h3>
              </div>
              <button
                onClick={() => setMissingEmailModalEmp(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Staff member <strong className="text-white">{missingEmailModalEmp.firstName} {missingEmailModalEmp.lastName}</strong> ({missingEmailModalEmp.empCode}) does not have an email address configured.
            </p>

            <form onSubmit={handleSaveMissingEmailAndSendInvite} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  ENTER STAFF WORK EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder={`${(missingEmailModalEmp.firstName || 'staff').toLowerCase()}.${(missingEmailModalEmp.lastName || 'member').toLowerCase()}@popejohnpaul2med.org`}
                  value={promptEmailValue}
                  onChange={(e) => setPromptEmailValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMissingEmailModalEmp(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Save Email & Dispatch Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SET OR CHANGE STAFF PORTAL PASSWORD */}
      {portalAccountModalEmp && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl p-6 sm:p-7 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">
                    Set / Change Staff Portal Password
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure official portal login credentials for this staff member
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPortalAccountModalEmp(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Staff Summary Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <img
                src={portalAccountModalEmp.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={portalAccountModalEmp.firstName}
                className="h-12 w-12 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm truncate">
                    {portalAccountModalEmp.firstName} {portalAccountModalEmp.lastName}
                  </h4>
                  <span className="font-mono text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-bold border border-slate-700">
                    {portalAccountModalEmp.empCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {portalAccountModalEmp.jobTitle} • {portalAccountModalEmp.department}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <span>Current Username: <strong className="text-indigo-300 font-mono">{portalAccountModalEmp.portalAccess?.username || portalAccountModalEmp.email || portalAccountModalEmp.empCode}</strong></span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSingleAccountCreateSubmit} className="space-y-4">
              {/* Login Username Format */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Portal Login Username Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    singleUsernameType === 'email'
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="singleUsername"
                      value="email"
                      checked={singleUsernameType === 'email'}
                      onChange={() => setSingleUsernameType('email')}
                      className="text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Work Email</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[170px] block">{portalAccountModalEmp.email || 'No email'}</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    singleUsernameType === 'empCode'
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="singleUsername"
                      value="empCode"
                      checked={singleUsernameType === 'empCode'}
                      onChange={() => setSingleUsernameType('empCode')}
                      className="text-indigo-600"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Staff Code</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">{portalAccountModalEmp.empCode}</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Password Option Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Staff Portal Password Assignment
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                  >
                    <Sparkles className="h-3 w-3" /> Generate Strong Password
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Custom Password */}
                  <div className={`p-3 rounded-2xl border transition ${
                    singlePasswordType === 'custom'
                      ? 'bg-slate-950 border-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="radio"
                        name="singlePasswordType"
                        value="custom"
                        checked={singlePasswordType === 'custom'}
                        onChange={() => setSinglePasswordType('custom')}
                        className="text-amber-500"
                      />
                      <span className="text-xs font-bold text-white">Set Specific / New Custom Password</span>
                    </label>

                    {singlePasswordType === 'custom' && (
                      <div className="relative mt-2">
                        <input
                          type={showSingleCustomPassword ? 'text' : 'password'}
                          value={singleCustomPassword}
                          onChange={(e) => setSingleCustomPassword(e.target.value)}
                          placeholder="Type new password (e.g. Hospital2026!)"
                          className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-500 focus:border-amber-500 focus:outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSingleCustomPassword(!showSingleCustomPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showSingleCustomPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reset to Staff ID */}
                  <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                    singlePasswordType === 'empCode'
                      ? 'bg-slate-950 border-emerald-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="singlePasswordType"
                        value="empCode"
                        checked={singlePasswordType === 'empCode'}
                        onChange={() => setSinglePasswordType('empCode')}
                        className="text-emerald-500"
                      />
                      <span className="text-xs font-bold">Reset to Staff Code (Default)</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">{portalAccountModalEmp.empCode}</span>
                  </label>

                  {/* Reset to Email */}
                  {portalAccountModalEmp.email && (
                    <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                      singlePasswordType === 'email'
                        ? 'bg-slate-950 border-indigo-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="singlePasswordType"
                          value="email"
                          checked={singlePasswordType === 'email'}
                          onChange={() => setSinglePasswordType('email')}
                          className="text-indigo-500"
                        />
                        <span className="text-xs font-bold">Reset to Work Email</span>
                      </div>
                      <span className="font-mono text-xs text-indigo-300 truncate max-w-[200px]">{portalAccountModalEmp.email}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Policy & Notification Options */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={singleRequireChangeOnLogin}
                    onChange={(e) => setSingleRequireChangeOnLogin(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500"
                  />
                  <span>Require staff member to change password upon their next login</span>
                </label>

                <div className="flex items-center gap-4 text-xs text-slate-300">
                  {portalAccountModalEmp.email && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={singleSendEmailNotification}
                        onChange={(e) => setSingleSendEmailNotification(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-700 text-indigo-500"
                      />
                      <span>Email credentials slip</span>
                    </label>
                  )}
                  {portalAccountModalEmp.phone && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={singleSendSmsNotification}
                        onChange={(e) => setSingleSendSmsNotification(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                      />
                      <span>SMS credentials notification</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPortalAccountModalEmp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-amber-900/30 transition flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5" /> Save & Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CreateStaffAccountModal
        isOpen={isCreateHrAccountModalOpen}
        onClose={() => setIsCreateHrAccountModalOpen(false)}
      />

      {/* ENROLL HR LEADERSHIP MODAL */}
      {isEnrollHrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 font-sans overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Enroll HR Directorate Leadership
                  </h3>
                  <p className="text-xs text-indigo-300/80">Human Resources Director & Senior Operations Manager</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnrollHrModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollHrSubmit} className="space-y-4 text-xs">
              {/* HR Role Selection */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEnrollHrForm((prev) => ({
                      ...prev,
                      role: 'hr_director',
                      jobTitle: 'Director of Human Resources',
                      empCode: prev.empCode === 'EMP-2044' ? 'EMP-1976' : prev.empCode,
                    }));
                  }}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                    enrollHrForm.role === 'hr_director'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>HR Director</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEnrollHrForm((prev) => ({
                      ...prev,
                      role: 'hr_manager',
                      jobTitle: 'Hospital HR Operations Manager',
                      empCode: prev.empCode === 'EMP-1976' ? 'EMP-2044' : prev.empCode,
                    }));
                  }}
                  className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                    enrollHrForm.role === 'hr_manager'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>HR Manager</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">First Name / Title *</label>
                  <input
                    type="text"
                    required
                    value={enrollHrForm.firstName}
                    onChange={(e) => setEnrollHrForm({ ...enrollHrForm, firstName: e.target.value })}
                    placeholder="e.g. Mr. Kwabena or Sarah"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Last Name / Surname *</label>
                  <input
                    type="text"
                    required
                    value={enrollHrForm.lastName}
                    onChange={(e) => setEnrollHrForm({ ...enrollHrForm, lastName: e.target.value })}
                    placeholder="e.g. Antwi or Mensah"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* HR Leader Gender Designation */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">Gender Designation *</label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    enrollHrForm.gender === 'Female'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : enrollHrForm.gender === 'Male'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}>
                    {enrollHrForm.gender === 'Female' ? '♀ Female Leader' : enrollHrForm.gender === 'Male' ? '♂ Male Leader' : '⚧ Other / Non-Binary'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['Female', 'Male', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEnrollHrForm((prev) => ({ ...prev, gender: g }))}
                      className={`py-2 px-3 rounded-xl font-bold transition border flex items-center justify-center gap-1.5 ${
                        enrollHrForm.gender === g
                          ? g === 'Female'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow'
                            : g === 'Male'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{g === 'Female' ? '♀ Female' : g === 'Male' ? '♂ Male' : '⚧ Other'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Staff Code / Identifier *</label>
                  <input
                    type="text"
                    required
                    value={enrollHrForm.empCode}
                    onChange={(e) => setEnrollHrForm({ ...enrollHrForm, empCode: e.target.value })}
                    placeholder="e.g. EMP-1976 or HR-001"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={enrollHrForm.password}
                    onChange={(e) => setEnrollHrForm({ ...enrollHrForm, password: e.target.value })}
                    placeholder="e.g. EMP-1976 or ADMIN123"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Work Email</label>
                  <input
                    type="email"
                    value={enrollHrForm.email}
                    onChange={(e) => setEnrollHrForm({ ...enrollHrForm, email: e.target.value })}
                    placeholder="e.g. kwabena.antwi@pjpiimc.org"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={enrollHrForm.phone}
                    onChange={(e) => setEnrollHrForm({ ...enrollHrForm, phone: e.target.value })}
                    placeholder="+233 24 555 2000"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Official Position Title</label>
                <input
                  type="text"
                  value={enrollHrForm.jobTitle}
                  onChange={(e) => setEnrollHrForm({ ...enrollHrForm, jobTitle: e.target.value })}
                  placeholder="Director of Human Resources"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" /> Granted HR Management Privileges:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-indigo-200/90">
                  <li>Full Staff Lifecycle & Recruitment Onboarding</li>
                  <li>Tier-2 HR Leave Verification & Certificate Archiving</li>
                  <li>Biometric Attendance, Rosters & Payroll Administration</li>
                  <li>Administrator Portal Access with HR Directorate Controls</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollHrModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-enroll-hr-modal"
                  disabled={isEnrollingHr}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2"
                >
                  {isEnrollingHr ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Enroll HR Leader</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL HEAD OF FACILITY MODAL */}
      {isEnrollHeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 font-sans overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Enroll Head of Facility
                  </h3>
                  <p className="text-xs text-emerald-300/80">Chief Executive Officer & Executive Council Head</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEnrollHeadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollHeadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">First Name / Title *</label>
                  <input
                    type="text"
                    required
                    value={enrollHeadForm.firstName}
                    onChange={(e) => setEnrollHeadForm({ ...enrollHeadForm, firstName: e.target.value })}
                    placeholder="e.g. Rev. Fr. Michael"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Last Name / Surname *</label>
                  <input
                    type="text"
                    required
                    value={enrollHeadForm.lastName}
                    onChange={(e) => setEnrollHeadForm({ ...enrollHeadForm, lastName: e.target.value })}
                    placeholder="e.g. Afoakwah"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Head of Facility Gender Designation */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-bold">Gender Designation *</label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    enrollHeadForm.gender === 'Female'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : enrollHeadForm.gender === 'Male'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}>
                    {enrollHeadForm.gender === 'Female' ? '♀ Female Leader' : enrollHeadForm.gender === 'Male' ? '♂ Male Leader' : '⚧ Other / Non-Binary'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEnrollHeadForm((prev) => ({ ...prev, gender: g }))}
                      className={`py-2 px-3 rounded-xl font-bold transition border flex items-center justify-center gap-1.5 ${
                        enrollHeadForm.gender === g
                          ? g === 'Female'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow'
                            : g === 'Male'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{g === 'Female' ? '♀ Female' : g === 'Male' ? '♂ Male' : '⚧ Other'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Staff Code / Identifier *</label>
                  <input
                    type="text"
                    required
                    value={enrollHeadForm.empCode}
                    onChange={(e) => setEnrollHeadForm({ ...enrollHeadForm, empCode: e.target.value })}
                    placeholder="e.g. EMP-3522"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Initial Login Password *</label>
                  <input
                    type="text"
                    required
                    value={enrollHeadForm.password}
                    onChange={(e) => setEnrollHeadForm({ ...enrollHeadForm, password: e.target.value })}
                    placeholder="e.g. EMP-3522 or SecurePass"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Official Email</label>
                  <input
                    type="email"
                    value={enrollHeadForm.email}
                    onChange={(e) => setEnrollHeadForm({ ...enrollHeadForm, email: e.target.value })}
                    placeholder="rev.fr.michael@pjpiimc.org"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={enrollHeadForm.phone}
                    onChange={(e) => setEnrollHeadForm({ ...enrollHeadForm, phone: e.target.value })}
                    placeholder="+233 24 222 1000"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Executive Title</label>
                <input
                  type="text"
                  value={enrollHeadForm.jobTitle}
                  onChange={(e) => setEnrollHeadForm({ ...enrollHeadForm, jobTitle: e.target.value })}
                  placeholder="Head of Facility / Chief Executive Officer"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-emerald-400" /> Executive Facility Privileges:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-emerald-200/90">
                  <li>Tier-3 Hospital Executive Governance & Final Approvals</li>
                  <li>Complete Administrative Registry & Institutional Reset Authority</li>
                  <li>Direct Access to Medical Council Audit & Regulatory Files</li>
                  <li>Leadership & Departmental Allocation Management</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollHeadModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-confirm-enroll-head-modal"
                  disabled={isEnrollingHead}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  {isEnrollingHead ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Enroll Head of Facility</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STAFF MEMBER DELETION CONFIRMATION */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-rose-500/30 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Delete Staff from System
                  </h3>
                  <p className="text-xs text-rose-400 font-medium">
                    Permanent Hospital Roster & Cloud Removal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStaffToDelete(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Employee Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
              <img
                src={staffToDelete.photo || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300'}
                alt={staffToDelete.firstName}
                className="h-12 w-12 rounded-xl object-cover border border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white truncate">
                    {staffToDelete.firstName} {staffToDelete.lastName}
                  </p>
                  <span className="font-mono text-[11px] font-bold text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {staffToDelete.empCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {staffToDelete.jobTitle} • {staffToDelete.department || 'General'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200/90 space-y-1">
              <p className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" /> Are you sure you want to delete this staff member?
              </p>
              <p className="text-[11px] text-slate-300">
                This will delete their employee profile, revoke portal access, and synchronize the deletion with Cloud Firestore.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                disabled={isDeletingSingle}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-staff"
                disabled={isDeletingSingle}
                onClick={async () => {
                  if (!staffToDelete) return;
                  setIsDeletingSingle(true);
                  try {
                    await deleteEmployee(staffToDelete.id);
                    setStaffToDelete(null);
                  } finally {
                    setIsDeletingSingle(false);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
              >
                {isDeletingSingle ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ALL STAFF HARD RESET CONFIRMATION */}
      {isDeleteAllStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-rose-500/40 text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-rose-500">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    Delete All Staff Records
                  </h3>
                  <p className="text-xs text-rose-500 font-semibold">
                    Complete Staff Directory Reset
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteAllStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete all <strong>{employees.length}</strong> staff profile(s) from the hospital system? This action will remove all staff directory entries, credential logins, and digital records from both the local application and Cloud Firestore.
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                What happens next:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                <li>All staff member profiles will be permanently erased.</li>
                <li>You can immediately self-enroll fresh facility leadership or add staff.</li>
                <li>Changes synchronize to Cloud Firestore in real time.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllStaffModalOpen(false)}
                disabled={isClearingAll}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 font-bold text-slate-600 dark:text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-all-staff"
                disabled={isClearingAll}
                onClick={async () => {
                  setIsClearingAll(true);
                  try {
                    await clearAllEmployees();
                    setIsDeleteAllStaffModalOpen(false);
                  } finally {
                    setIsClearingAll(false);
                  }
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 font-bold text-white text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
              >
                {isClearingAll ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Yes, Delete All Staff</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
