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
} from '../../types/hrms';
import { DepartmentLeadershipManager } from './DepartmentLeadershipManager';
import { OrgHierarchyView } from './OrgHierarchyView';
import { CreateStaffAccountModal } from './CreateStaffAccountModal';

export const EmployeeDirectory: React.FC = () => {
  const {
    employees,
    formatCurrency,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    selectedHospital,
    createEmployeePortalAccount,
    batchCreateAndInvitePortalAccounts,
    sendPortalInviteEmail,
  } = useHrms();

  // Active Main View: 'directory' (Cards/Profiles) | 'portal_accounts' (Logins & Portal Invites) | 'leadership' (HOD/HOU Governance) | 'hierarchy' (Interactive Org Chart)
  const [activeView, setActiveView] = useState<'directory' | 'portal_accounts' | 'leadership' | 'hierarchy'>('directory');

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [inviteStatusFilter, setInviteStatusFilter] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateHrAccountModalOpen, setIsCreateHrAccountModalOpen] = useState(false);

  // EDIT EMPLOYEE STATE
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editActiveTab, setEditActiveTab] = useState<
    'general' | 'documents' | 'education' | 'contacts' | 'employment' | 'licenses' | 'health'
  >('general');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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
  const [singlePasswordType, setSinglePasswordType] = useState<'empCode' | 'email' | 'custom'>('empCode');
  const [singleCustomPassword, setSingleCustomPassword] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // New employee form state
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: 'Staff Nurse',
    department: 'Intensive Care Unit (ICU)',
    salary: 7500,
    role: 'nurse',
    usernameType: 'email' as 'email' | 'empCode',
    passwordType: 'empCode' as 'empCode' | 'email',
    sendInviteNow: true,
  });

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      `${e.firstName} ${e.lastName} ${e.empCode} ${e.email} ${e.jobTitle}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || e.department === deptFilter;

    let matchesInvite = true;
    if (inviteStatusFilter === 'Sent') {
      matchesInvite = e.portalAccess?.inviteStatus === 'Invitation Sent';
    } else if (inviteStatusFilter === 'Activated') {
      matchesInvite = e.portalAccess?.inviteStatus === 'Portal Activated';
    } else if (inviteStatusFilter === 'Not Invited') {
      matchesInvite = !e.portalAccess || e.portalAccess?.inviteStatus === 'Not Invited';
    }

    return matchesSearch && matchesDept && matchesInvite;
  });

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.lastName) return;

    const createdEmp = addEmployee({
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      email: newEmp.email,
      phone: newEmp.phone,
      jobTitle: newEmp.jobTitle,
      department: newEmp.department,
      salary: Number(newEmp.salary),
      role: newEmp.role as any,
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
      email: '',
      phone: '',
      jobTitle: 'Staff Nurse',
      department: 'Intensive Care Unit (ICU)',
      salary: 7500,
      role: 'nurse',
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
      medicalLicenses: editingEmployee.medicalLicenses.filter((l) => l.id !== licId),
    });
  };

  const handleSingleAccountCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalAccountModalEmp) return;

    const empId = portalAccountModalEmp.id;
    setPortalAccountModalEmp(null);

    const result = await createEmployeePortalAccount(empId, {
      usernameType: singleUsernameType,
      passwordType: singlePasswordType,
      customPassword: singleCustomPassword,
      sendInviteEmail: true,
    });

    if (result.success) {
      setEmailDispatchModal(result);
      setEmailDispatchLog((prev) => [result, ...prev]);
      showToast('success', 'Account Created & Email Sent', `Portal credentials emailed to ${result.recipientEmail}`);
    } else {
      showToast('error', 'Account Created (Email Warning)', result.error || 'Created credentials without email.');
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 border border-slate-800 text-white shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Healthcare Staff Directory & HR File Management
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Pencil className="h-3 w-3" /> HR Edit Access Enabled
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              HR administrators have full access to edit employee personal details, job titles, departments, salaries, medical licenses, compliance files, and portal credentials.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Navigation Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('directory')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'directory'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" /> Staff Profiles & Files
            </button>
            <button
              onClick={() => setActiveView('portal_accounts')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'portal_accounts'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="h-4 w-4 text-indigo-300" /> Portal Logins & Invites
            </button>
            <button
              onClick={() => setActiveView('leadership')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'leadership'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="h-4 w-4 text-amber-300" /> Department & Unit Leadership
            </button>
            <button
              onClick={() => setActiveView('hierarchy')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeView === 'hierarchy'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitFork className="h-4 w-4 text-emerald-300" /> Org Hierarchy Tree
            </button>
          </div>

          <button
            onClick={() => setActiveView('leadership')}
            className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow transition active:scale-95 border border-amber-400/30"
          >
            <Building2 className="h-4 w-4" /> (ADD DEPARTMENT)
          </button>

          <button
            onClick={() => setIsCreateHrAccountModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow transition active:scale-95 border border-indigo-400/30"
          >
            <UserPlus className="h-4 w-4" /> Provision Staff Account (HR)
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Staff Profile
          </button>
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
                            <img
                              src={emp.photo}
                              alt={emp.firstName}
                              className="h-10 w-10 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white">
                                {emp.firstName} {emp.lastName}
                              </p>
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
                            <span className="font-mono text-amber-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-bold">
                              {showPass ? tempPassword : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(emp.id)}
                              className="text-slate-500 hover:text-white p-1"
                              title="Toggle View Password"
                            >
                              {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
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
                              <Send className="h-3 w-3" /> Invite
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

      {/* VIEW 1: STANDARD DIRECTORY CARDS VIEW */}
      {activeView === 'directory' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, code (DOC-1001), email, or title..."
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
                  <option value="Cardiology & Intensive Care">Cardiology & ICU</option>
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                  <option value="Human Resources & Workforce">Human Resources</option>
                  <option value="Surgical Services & OT">Surgical Services</option>
                  <option value="Pharmacy & Clinical Pharmacology">Pharmacy</option>
                </select>
              </div>

              <select
                value={inviteStatusFilter}
                onChange={(e) => setInviteStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Portal Access Statuses</option>
                <option value="Sent">Invitation Sent</option>
                <option value="Activated">Portal Activated</option>
                <option value="Not Invited">Not Invited</option>
              </select>
            </div>
          </div>

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((emp) => {
              const activeLicenses = emp.medicalLicenses.filter((l) => l.status === 'Active').length;
              const expiringLicenses = emp.medicalLicenses.filter(
                (l) => l.status === 'Expiring Soon' || l.status === 'Expired'
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
                        <img
                          src={emp.photo}
                          alt={emp.firstName}
                          className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500/20"
                        />
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
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {emp.empCode}
                      </span>
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
                        onClick={() => handleTriggerSendInvite(emp.id)}
                        className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition"
                        title="Resend Portal Login Invite"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        title="Remove Employee"
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE DETAILS & DIGITAL FILE (CRITICAL HR EDIT ACCESS) */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-950/90 backdrop-blur border-b border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <img
                  src={editingEmployee.photo}
                  alt={editingEmployee.firstName}
                  className="h-11 w-11 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Edit Employee Details & Digital File
                    </h3>
                    <span className="font-mono text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      {editingEmployee.empCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {editingEmployee.firstName} {editingEmployee.lastName} • {editingEmployee.jobTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingEmployee(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success Toast */}
            {saveSuccessMsg && (
              <div className="m-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {saveSuccessMsg}
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 pt-2 text-xs font-bold gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditActiveTab('general')}
                className={`pb-3 pt-2 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
                  editActiveTab === 'general'
                    ? 'border-emerald-500 text-emerald-400 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="h-4 w-4" /> Personal & Ghana Card
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
                <FileText className="h-4 w-4 text-cyan-400" /> Official Letters & HR Files
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
                <GraduationCap className="h-4 w-4 text-indigo-400" /> Education Background
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
                <PhoneCall className="h-4 w-4 text-amber-400" /> Emergency Contacts
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
                <Briefcase className="h-4 w-4" /> Position & Compensation
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
                <Award className="h-4 w-4 text-amber-400" /> Medical Licenses ({editingEmployee.medicalLicenses?.length || 0})
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
                <Stethoscope className="h-4 w-4 text-rose-400" /> Health & Signature
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEmployeeEdits} className="p-6 space-y-5 text-xs flex-1">
              {/* TAB 1: PERSONAL & GHANA CARD DETAILS */}
              {editActiveTab === 'general' && (
                <div className="space-y-5">
                  {/* Staff Photo Upload Section */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={editingEmployee.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'}
                        alt={editingEmployee.firstName}
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                      />
                      <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-500 transition">
                        <Camera className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        Staff Profile Photo
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                          Live Reader
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Upload official HR passport photograph or high-resolution ID portrait.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="cursor-pointer px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 transition flex items-center gap-1.5">
                          <Upload className="h-3 w-3" /> Upload Photo File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={editingEmployee.firstName}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, firstName: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={editingEmployee.lastName}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, lastName: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Email Address (Portal Username)</label>
                      <input
                        type="email"
                        required
                        value={editingEmployee.email}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, email: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Primary Phone Number</label>
                      <input
                        type="text"
                        required
                        value={editingEmployee.phone}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, phone: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Passport Number</label>
                      <input
                        type="text"
                        value={editingEmployee.passportNo || ''}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, passportNo: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">General Identification ID</label>
                      <input
                        type="text"
                        value={editingEmployee.nationalId || ''}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, nationalId: e.target.value })
                        }
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
                            Ghana Card PIN registration, verification & ID scan attachments
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        editingEmployee.ghanaCardInfo?.verificationStatus === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {editingEmployee.ghanaCardInfo?.verificationStatus || 'Pending Verification'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                          Ghana Card PIN (GHA-XXXXXXXXX-X)
                        </label>
                        <input
                          type="text"
                          value={editingEmployee.ghanaCardInfo?.cardPin || editingEmployee.nationalId || ''}
                          onChange={(e) => {
                            const pin = e.target.value;
                            const currGhana = editingEmployee.ghanaCardInfo || {
                              cardPin: pin,
                              verificationStatus: 'Verified',
                            };
                            setEditingEmployee({
                              ...editingEmployee,
                              nationalId: pin,
                              ghanaCardInfo: { ...currGhana, cardPin: pin },
                            });
                          }}
                          placeholder="GHA-719302841-0"
                          className="w-full rounded-xl bg-slate-900 border border-amber-500/40 p-2.5 text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                          Card Issue Date
                        </label>
                        <input
                          type="date"
                          value={editingEmployee.ghanaCardInfo?.issueDate || ''}
                          onChange={(e) => {
                            const date = e.target.value;
                            const currGhana = editingEmployee.ghanaCardInfo || {
                              cardPin: editingEmployee.nationalId || 'GHA-000000000-0',
                              verificationStatus: 'Verified',
                            };
                            setEditingEmployee({
                              ...editingEmployee,
                              ghanaCardInfo: { ...currGhana, issueDate: date },
                            });
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[11px] mb-1">
                          Card Expiry Date
                        </label>
                        <input
                          type="date"
                          value={editingEmployee.ghanaCardInfo?.expiryDate || ''}
                          onChange={(e) => {
                            const date = e.target.value;
                            const currGhana = editingEmployee.ghanaCardInfo || {
                              cardPin: editingEmployee.nationalId || 'GHA-000000000-0',
                              verificationStatus: 'Verified',
                            };
                            setEditingEmployee({
                              ...editingEmployee,
                              ghanaCardInfo: { ...currGhana, expiryDate: date },
                            });
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Front Scan */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1">
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" /> Front Scan Copy
                          </span>
                          {editingEmployee.ghanaCardInfo?.frontCopyUrl && (
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              Attached
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate">
                          {editingEmployee.ghanaCardInfo?.frontCopyName || 'No front scan uploaded'}
                        </p>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] transition">
                          <Upload className="h-3.5 w-3.5" /> Upload Front Scan
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleGhanaCardFrontUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Back Scan */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1">
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" /> Back Scan Copy
                          </span>
                          {editingEmployee.ghanaCardInfo?.backCopyUrl && (
                            <span className="text-[10px] text-emerald-400 font-semibold">
                              Attached
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate">
                          {editingEmployee.ghanaCardInfo?.backCopyName || 'No back scan uploaded'}
                        </p>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] transition">
                          <Upload className="h-3.5 w-3.5" /> Upload Back Scan
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleGhanaCardBackUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OFFICIAL HR LETTERS & DOCUMENTS */}
              {editActiveTab === 'documents' && (
                <div className="space-y-5">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-2">
                      <FileUp className="h-4 w-4 text-cyan-400" /> Mandatory Official Employment Documents
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      HR staff file attachment vault for Appointment Letters, Assumption of Duty Letters, and Transfer Documents.
                    </p>
                  </div>

                  {/* 3 Main Required Documents Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Appointment Letter */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-cyan-300 text-xs flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-cyan-400" /> Appointment Letter
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            editingEmployee.appointmentLetterUrl
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {editingEmployee.appointmentLetterUrl ? 'Uploaded' : 'Missing'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Official facility engagement contract & terms
                        </p>
                        <p className="text-[10px] font-mono text-slate-300 mt-2 truncate">
                          {editingEmployee.appointmentLetterName || 'No document uploaded'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                        <label className="cursor-pointer flex-1 py-1.5 px-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] text-center transition flex items-center justify-center gap-1">
                          <Upload className="h-3 w-3" /> Upload
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/*"
                            onChange={handleAppointmentLetterUpload}
                            className="hidden"
                          />
                        </label>
                        {editingEmployee.appointmentLetterUrl && (
                          <a
                            href={editingEmployee.appointmentLetterUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 transition"
                            title="View / Download Appointment Letter"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Assumption of Duty Letter */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-emerald-300 text-xs flex items-center gap-1.5">
                            <FileCheck className="h-4 w-4 text-emerald-400" /> Assumption of Duty
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            editingEmployee.assumptionOfDutyUrl
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {editingEmployee.assumptionOfDutyUrl ? 'Uploaded' : 'Missing'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Formal confirmation of duty commencement at facility
                        </p>
                        <p className="text-[10px] font-mono text-slate-300 mt-2 truncate">
                          {editingEmployee.assumptionOfDutyName || 'No document uploaded'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                        <label className="cursor-pointer flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] text-center transition flex items-center justify-center gap-1">
                          <Upload className="h-3 w-3" /> Upload
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/*"
                            onChange={handleAssumptionOfDutyUpload}
                            className="hidden"
                          />
                        </label>
                        {editingEmployee.assumptionOfDutyUrl && (
                          <a
                            href={editingEmployee.assumptionOfDutyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 text-emerald-300 hover:bg-slate-700 transition"
                            title="View / Download Assumption of Duty Letter"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Transfer Documents */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-indigo-300 text-xs flex items-center gap-1.5">
                            <GitFork className="h-4 w-4 text-indigo-400" /> Transfer / Posting
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            editingEmployee.transferDocumentUrl
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {editingEmployee.transferDocumentUrl ? 'Uploaded' : 'Optional'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Posting, inter-hospital transfer, or redeployment records
                        </p>
                        <p className="text-[10px] font-mono text-slate-300 mt-2 truncate">
                          {editingEmployee.transferDocumentName || 'No transfer doc attached'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                        <label className="cursor-pointer flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] text-center transition flex items-center justify-center gap-1">
                          <Upload className="h-3 w-3" /> Upload
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/*"
                            onChange={handleTransferDocUpload}
                            className="hidden"
                          />
                        </label>
                        {editingEmployee.transferDocumentUrl && (
                          <a
                            href={editingEmployee.transferDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:bg-slate-700 transition"
                            title="View / Download Transfer Document"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add Custom Official Document Form */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <Plus className="h-4 w-4 text-emerald-400" /> Add Custom Official Staff Document
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Document Title
                        </label>
                        <input
                          type="text"
                          value={newDocTitle}
                          onChange={(e) => setNewDocTitle(e.target.value)}
                          placeholder="e.g. Promotion Letter 2026"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Category / Type
                        </label>
                        <select
                          value={newDocType}
                          onChange={(e) => setNewDocType(e.target.value as any)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Appointment Letter">Appointment Letter</option>
                          <option value="Assumption of Duty Letter">Assumption of Duty Letter</option>
                          <option value="Transfer Document">Transfer Document</option>
                          <option value="Promotion Letter">Promotion Letter</option>
                          <option value="Demotion / Disciplinary Letter">Demotion / Disciplinary</option>
                          <option value="Leave Document">Leave Document</option>
                          <option value="Other">Other Document</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          File Attachment
                        </label>
                        <label className="cursor-pointer flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-300 hover:border-emerald-500 transition">
                          <span className="truncate text-[10px]">
                            {newDocFileName || 'Choose PDF / Doc File'}
                          </span>
                          <Paperclip className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <input
                            type="file"
                            onChange={handleNewDocFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <input
                        type="text"
                        value={newDocNotes}
                        onChange={(e) => setNewDocNotes(e.target.value)}
                        placeholder="Optional remarks or document tracking reference code..."
                        className="flex-1 mr-3 rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={handleAddOfficialDocSubmit}
                        disabled={!newDocTitle || !newDocFileName}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        Save Document to File
                      </button>
                    </div>
                  </div>

                  {/* List of Uploaded Official Documents */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-300 text-xs">
                      All Registered Official Files ({editingEmployee.officialDocuments?.length || 0})
                    </h5>

                    {(!editingEmployee.officialDocuments || editingEmployee.officialDocuments.length === 0) ? (
                      <p className="text-slate-500 text-xs italic p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        No additional official documents registered yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {editingEmployee.officialDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-slate-900 text-cyan-400">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <h6 className="font-bold text-white text-xs">{doc.title}</h6>
                                <p className="text-[10px] text-slate-400">
                                  Category: {doc.type} • Uploaded {doc.uploadedAt} by {doc.uploadedBy}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {doc.fileUrl && (
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 transition text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" /> View / Download
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveOfficialDoc(doc.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete Document"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: STAFF EDUCATION BACKGROUND */}
              {editActiveTab === 'education' && (
                <div className="space-y-5">
                  {/* Form to add Education Item */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-indigo-400" /> Add Staff Educational Background
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Institution / University
                        </label>
                        <input
                          type="text"
                          value={newEduInst}
                          onChange={(e) => setNewEduInst(e.target.value)}
                          placeholder="e.g. University of Ghana / Korle Bu Nursing College"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Degree / Qualification
                        </label>
                        <input
                          type="text"
                          value={newEduQual}
                          onChange={(e) => setNewEduQual(e.target.value)}
                          placeholder="e.g. Bachelor of Science in Nursing (BSc)"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Field of Study / Specialization
                        </label>
                        <input
                          type="text"
                          value={newEduField}
                          onChange={(e) => setNewEduField(e.target.value)}
                          placeholder="e.g. Critical Care Nursing"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Years Attended (Start - Grad)
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          <input
                            type="text"
                            value={newEduStartYear}
                            onChange={(e) => setNewEduStartYear(e.target.value)}
                            placeholder="2018"
                            className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-center"
                          />
                          <input
                            type="text"
                            value={newEduGradYear}
                            onChange={(e) => setNewEduGradYear(e.target.value)}
                            placeholder="2022"
                            className="rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Certificate Scan Upload
                        </label>
                        <label className="cursor-pointer flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-300 hover:border-indigo-500 transition">
                          <span className="truncate text-[10px]">
                            {newEduCertName || 'Choose Certificate File'}
                          </span>
                          <Upload className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleEduCertFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleAddEducationSubmit}
                        disabled={!newEduInst || !newEduQual}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
                      >
                        + Add Qualification to File
                      </button>
                    </div>
                  </div>

                  {/* List of Added Educational Backgrounds */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-300 text-xs">
                      Educational Qualifications ({editingEmployee.educationList?.length || 0})
                    </h5>

                    {(!editingEmployee.educationList || editingEmployee.educationList.length === 0) ? (
                      <p className="text-slate-500 text-xs italic p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        No detailed educational history recorded.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {editingEmployee.educationList.map((edu) => (
                          <div
                            key={edu.id}
                            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h6 className="font-extrabold text-indigo-300 text-xs">
                                  {edu.qualification}
                                </h6>
                                <p className="text-[11px] text-slate-200 font-medium">
                                  {edu.institution} • {edu.fieldOfStudy}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveEducation(edu.id)}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold p-1 rounded hover:bg-rose-500/10 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                              <span>Graduation Year: {edu.graduationYear || 'N/A'}</span>
                              {edu.certificateUrl && (
                                <a
                                  href={edu.certificateUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-400 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" /> Certificate Attached
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: EMERGENCY CONTACTS */}
              {editActiveTab === 'contacts' && (
                <div className="space-y-5">
                  {/* Form to add Emergency Contact */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-amber-400" /> Add Emergency Contact
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Contact Person Full Name
                        </label>
                        <input
                          type="text"
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          placeholder="e.g. Mary Kingsley"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Relationship to Staff
                        </label>
                        <select
                          value={newContactRel}
                          onChange={(e) => setNewContactRel(e.target.value)}
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                        >
                          <option value="Spouse">Spouse</option>
                          <option value="Parent / Mother">Parent / Mother</option>
                          <option value="Parent / Father">Parent / Father</option>
                          <option value="Sibling / Brother">Sibling / Brother</option>
                          <option value="Sibling / Sister">Sibling / Sister</option>
                          <option value="Next of Kin">Next of Kin</option>
                          <option value="Guardian / Other">Guardian / Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Primary Phone Number
                        </label>
                        <input
                          type="text"
                          value={newContactPhone}
                          onChange={(e) => setNewContactPhone(e.target.value)}
                          placeholder="+233 24 123 4567"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Secondary Phone (Optional)
                        </label>
                        <input
                          type="text"
                          value={newContactAltPhone}
                          onChange={(e) => setNewContactAltPhone(e.target.value)}
                          placeholder="+233 20 987 6543"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold text-[10px] mb-1">
                          Residential Address
                        </label>
                        <input
                          type="text"
                          value={newContactAddress}
                          onChange={(e) => setNewContactAddress(e.target.value)}
                          placeholder="Plot 14 East Legon, Accra"
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddEmergencyContactSubmit}
                        disabled={!newContactName || !newContactPhone}
                        className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
                      >
                        + Add Emergency Contact
                      </button>
                    </div>
                  </div>

                  {/* List of Registered Emergency Contacts */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-300 text-xs">
                      Registered Emergency Contacts ({editingEmployee.emergencyContacts?.length || 0})
                    </h5>

                    {(!editingEmployee.emergencyContacts || editingEmployee.emergencyContacts.length === 0) ? (
                      <p className="text-slate-500 text-xs italic p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                        No emergency contacts registered yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {editingEmployee.emergencyContacts.map((contact, idx) => (
                          <div
                            key={contact.id || idx}
                            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 text-xs">
                                {contact.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {contact.relation}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-200 font-mono flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-emerald-400" /> {contact.phone}
                              {contact.altPhone && <span className="text-slate-500">/ {contact.altPhone}</span>}
                            </p>

                            {contact.address && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-rose-400 shrink-0" /> {contact.address}
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveEmergencyContact(idx)}
                              className="absolute top-3 right-3 text-rose-400 hover:text-rose-300 p-1"
                              title="Remove Contact"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: POSITION & COMPENSATION */}
              {editActiveTab === 'employment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Job Title / Designation</label>
                      <input
                        type="text"
                        required
                        value={editingEmployee.jobTitle}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, jobTitle: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-semibold text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Department</label>
                      <select
                        value={editingEmployee.department}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, department: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                      >
                        <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                        <option value="Cardiology & Intensive Care">Cardiology & ICU</option>
                        <option value="Emergency & Trauma">Emergency & Trauma</option>
                        <option value="Human Resources & Workforce">Human Resources</option>
                        <option value="Surgical Services & OT">Surgical Services & OT</option>
                        <option value="Pharmacy & Clinical Pharmacology">Pharmacy</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Monthly Base Salary ($)</label>
                      <input
                        type="number"
                        required
                        value={editingEmployee.salary}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, salary: Number(e.target.value) })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-bold text-amber-300"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Employment Join Date</label>
                      <input
                        type="date"
                        value={editingEmployee.joinDate}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, joinDate: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Bank Account IBAN / Number</label>
                      <input
                        type="text"
                        value={editingEmployee.bankAccount || ''}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, bankAccount: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Tax Registration ID</label>
                      <input
                        type="text"
                        value={editingEmployee.taxId || ''}
                        onChange={(e) =>
                          setEditingEmployee({ ...editingEmployee, taxId: e.target.value })
                        }
                        className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: MEDICAL LICENSES & CERTIFICATIONS */}
              {editActiveTab === 'licenses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-xs">Medical Practice Licenses & Certs File</h4>
                      <p className="text-[10px] text-slate-400">
                        Update Medical Council, MOH, BLS, ACLS, and clinical licenses attached to this file.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLicenseToEdit}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition flex items-center gap-1 shadow"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add License
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingEmployee.medicalLicenses.map((lic, index) => (
                      <div
                        key={lic.id || index}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-amber-400" /> License #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLicenseFromEdit(lic.id)}
                            className="text-rose-400 hover:text-rose-300 text-[11px] font-bold flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 font-medium text-[10px] mb-1">
                              License / Cert Type
                            </label>
                            <input
                              type="text"
                              value={lic.licenseType}
                              onChange={(e) => {
                                const newLics = [...editingEmployee.medicalLicenses];
                                newLics[index].licenseType = e.target.value;
                                setEditingEmployee({ ...editingEmployee, medicalLicenses: newLics });
                              }}
                              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-medium text-[10px] mb-1">
                              License Number
                            </label>
                            <input
                              type="text"
                              value={lic.licenseNumber}
                              onChange={(e) => {
                                const newLics = [...editingEmployee.medicalLicenses];
                                newLics[index].licenseNumber = e.target.value;
                                setEditingEmployee({ ...editingEmployee, medicalLicenses: newLics });
                              }}
                              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-400 font-medium text-[10px] mb-1">
                              Issuing Authority
                            </label>
                            <input
                              type="text"
                              value={lic.issuingAuthority}
                              onChange={(e) => {
                                const newLics = [...editingEmployee.medicalLicenses];
                                newLics[index].issuingAuthority = e.target.value;
                                setEditingEmployee({ ...editingEmployee, medicalLicenses: newLics });
                              }}
                              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-medium text-[10px] mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="date"
                              value={lic.expiryDate}
                              onChange={(e) => {
                                const newLics = [...editingEmployee.medicalLicenses];
                                newLics[index].expiryDate = e.target.value;
                                setEditingEmployee({ ...editingEmployee, medicalLicenses: newLics });
                              }}
                              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 font-medium text-[10px] mb-1">
                              License Status
                            </label>
                            <select
                              value={lic.status}
                              onChange={(e) => {
                                const newLics = [...editingEmployee.medicalLicenses];
                                newLics[index].status = e.target.value as any;
                                setEditingEmployee({ ...editingEmployee, medicalLicenses: newLics });
                              }}
                              className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none font-bold"
                            >
                              <option value="Active">Active</option>
                              <option value="Expiring Soon">Expiring Soon</option>
                              <option value="Expired">Expired</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: HEALTH & DIGITAL SIGNATURE */}
              {editActiveTab === 'health' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-emerald-400" /> Occupational Health & Duty Fitness
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 font-medium text-[10px] mb-1">
                          Fitness for Duty Status
                        </label>
                        <select
                          value={editingEmployee.occupationalHealth?.fitForDuty ? 'true' : 'false'}
                          onChange={(e) =>
                            setEditingEmployee({
                              ...editingEmployee,
                              occupationalHealth: {
                                ...editingEmployee.occupationalHealth,
                                fitForDuty: e.target.value === 'true',
                              },
                            })
                          }
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200 font-bold focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="true">✓ Certified Fit for Duty</option>
                          <option value="false">⚠ Restricted / Unfit for Duty</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-medium text-[10px] mb-1">
                          Last Occupational Health Exam Date
                        </label>
                        <input
                          type="date"
                          value={editingEmployee.occupationalHealth?.lastExamDate || ''}
                          onChange={(e) =>
                            setEditingEmployee({
                              ...editingEmployee,
                              occupationalHealth: {
                                ...editingEmployee.occupationalHealth,
                                lastExamDate: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-medium text-[10px] mb-1">
                        Occupational Health Notes & Work Limitations
                      </label>
                      <textarea
                        rows={2}
                        value={editingEmployee.occupationalHealth?.notes || ''}
                        onChange={(e) =>
                          setEditingEmployee({
                            ...editingEmployee,
                            occupationalHealth: {
                              ...editingEmployee.occupationalHealth,
                              notes: e.target.value,
                            },
                          })
                        }
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white text-xs flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-indigo-400" /> Digital Signature & Compliance Asset
                    </h4>
                    <div>
                      <label className="block text-slate-400 font-medium text-[10px] mb-1">
                        Digital Signature URL / Compliance Record
                      </label>
                      <input
                        type="text"
                        value={editingEmployee.digitalSignatureUrl || ''}
                        onChange={(e) =>
                          setEditingEmployee({
                            ...editingEmployee,
                            digitalSignatureUrl: e.target.value,
                          })
                        }
                        placeholder="https://aurahr.health/signatures/emp-sig-101.png"
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="sticky bottom-0 bg-slate-900/90 backdrop-blur border-t border-slate-800 pt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  HR Administrator Audit Trail Enabled
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow-lg flex items-center gap-1.5"
                  >
                    <Save className="h-4 w-4" /> Save Employee File Updates
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SINGLE STAFF PORTAL ACCOUNT CONFIGURATION */}
      {portalAccountModalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-base">Configure Staff Portal Login</h3>
              </div>
              <button
                onClick={() => setPortalAccountModalEmp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
              <img
                src={portalAccountModalEmp.photo}
                alt={portalAccountModalEmp.firstName}
                className="h-10 w-10 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <p className="font-bold text-slate-100 text-xs">
                  {portalAccountModalEmp.firstName} {portalAccountModalEmp.lastName}
                </p>
                <p className="text-[10px] text-slate-400">
                  Staff ID: {portalAccountModalEmp.empCode} • {portalAccountModalEmp.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSingleAccountCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Username Option</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSingleUsernameType('email')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      singleUsernameType === 'email'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Email Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleUsernameType('empCode')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      singleUsernameType === 'empCode'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Staff ID ({portalAccountModalEmp.empCode})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Initial Password</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSinglePasswordType('empCode')}
                    className={`p-2 rounded-xl border text-center text-[11px] font-bold transition ${
                      singlePasswordType === 'empCode'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Staff ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setSinglePasswordType('email')}
                    className={`p-2 rounded-xl border text-center text-[11px] font-bold transition ${
                      singlePasswordType === 'email'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setSinglePasswordType('custom')}
                    className={`p-2 rounded-xl border text-center text-[11px] font-bold transition ${
                      singlePasswordType === 'custom'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {singlePasswordType === 'custom' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Custom Temporary Password</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AuraPass2026!"
                    value={singleCustomPassword}
                    onChange={(e) => setSingleCustomPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-indigo-200 text-[11px] flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <span>An email invitation with login instructions will be sent automatically.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPortalAccountModalEmp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-lg"
                >
                  Save & Send Login Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Employee Profile File Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Banner */}
            <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={selectedEmployee.photo}
                  alt={selectedEmployee.firstName}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedEmployee.jobTitle} • {selectedEmployee.department}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Emp Code: {selectedEmployee.empCode} • Joined {selectedEmployee.joinDate}
                  </p>
                </div>
              </div>

              {/* Edit Employee File Button inside Profile view */}
              <button
                onClick={() => {
                  const empToEdit = selectedEmployee;
                  handleOpenEditModal(empToEdit);
                }}
                className="mr-10 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow flex items-center gap-1.5"
              >
                <Pencil className="h-4 w-4" /> Edit Employee File
              </button>
            </div>

            {/* Tabs & Details */}
            <div className="mt-6 space-y-6 text-xs">
              {/* Portal Access Credentials Card */}
              <div className="rounded-2xl bg-indigo-950/30 p-4 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                  <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                    <Key className="h-4 w-4 text-indigo-400" /> Portal Account Credentials & Access
                  </h4>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    {selectedEmployee.portalAccess?.inviteStatus || 'Invitation Sent'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">USERNAME</span>
                    <p className="font-mono text-emerald-400 font-bold text-xs mt-0.5">
                      {selectedEmployee.portalAccess?.username || selectedEmployee.email}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">INITIAL PASSWORD</span>
                    <p className="font-mono text-amber-300 font-bold text-xs mt-0.5">
                      {selectedEmployee.portalAccess?.tempPassword || selectedEmployee.empCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Portal Auth: Staff ID or Email Password Login
                  </span>
                  <button
                    onClick={() => handleTriggerSendInvite(selectedEmployee.id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Resend Credentials Email
                  </button>
                </div>
              </div>

              {/* Personal & Financial Details */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Passport / National ID</span>
                  <p className="font-semibold">{selectedEmployee.passportNo} / {selectedEmployee.nationalId}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Bank & Tax Account</span>
                  <p className="font-semibold">{selectedEmployee.bankAccount} (Tax: {selectedEmployee.taxId})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Base Salary</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedEmployee.salary)} / mo
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Education</span>
                  <p className="font-semibold">{selectedEmployee.education}</p>
                </div>
              </div>

              {/* Medical Licenses & Certifications */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-500" /> Hospital Medical Licenses & Certs
                </h4>
                <div className="space-y-2">
                  {selectedEmployee.medicalLicenses.map((lic) => (
                    <div
                      key={lic.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{lic.licenseType}</span>
                        <p className="text-[10px] text-slate-400">
                          No: {lic.licenseNumber} • Issued by {lic.issuingAuthority}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            lic.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          }`}
                        >
                          {lic.status} (Expires: {lic.expiryDate})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Occupational Health & Vaccines */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2">
                  Vaccinations & Fitness for Duty
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedEmployee.vaccinations.map((v) => (
                    <div key={v.id} className="rounded-lg bg-slate-100 p-2.5 dark:bg-slate-800/60">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{v.vaccineName}</span>
                      <p className="text-[10px] text-emerald-600 font-medium">✓ {v.status} ({v.doseDate})</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" /> Create Staff Profile & Portal Login
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
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
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                    <option value="Cardiology & Intensive Care">Cardiology & ICU</option>
                    <option value="Emergency & Trauma">Emergency & Trauma</option>
                    <option value="Human Resources & Workforce">Human Resources</option>
                    <option value="Surgical Services & OT">Surgical Services & OT</option>
                    <option value="Pharmacy & Clinical Pharmacology">Pharmacy</option>
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" /> SMTP Email Dispatched
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

      <CreateStaffAccountModal
        isOpen={isCreateHrAccountModalOpen}
        onClose={() => setIsCreateHrAccountModalOpen(false)}
      />
    </div>
  );
};
