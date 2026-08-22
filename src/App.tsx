import React, { useState, useEffect } from 'react';
import { HrmsProvider, useHrms } from './context/HrmsContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory';
import { CredentialTracker } from './components/credentials/CredentialTracker';
import { ShiftRosterManager } from './components/shifts/ShiftRosterManager';
import { BiometricAttendance } from './components/attendance/BiometricAttendance';
import { LeaveManagement } from './components/leave/LeaveManagement';
import { PayrollProcessor } from './components/payroll/PayrollProcessor';
import { RecruitmentATS } from './components/recruitment/RecruitmentATS';
import { OnboardingWorkflow } from './components/onboarding/OnboardingWorkflow';
import { LearningHub } from './components/lms/LearningHub';
import { EmployeeHealthIncidents } from './components/health/EmployeeHealthIncidents';
import { GrievanceManagement } from './components/grievances/GrievanceManagement';
import { DisciplinaryBoardManager } from './components/employees/DisciplinaryBoardManager';
import { PerformanceManagement } from './components/performance/PerformanceManagement';
import { AssetManager } from './components/assets/AssetManager';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { CustomReportsExporter } from './components/reports/CustomReportsExporter';
import { RestApiBrowser } from './components/api/RestApiBrowser';
import { DepartmentConferencePlatform } from './components/conference/DepartmentConferencePlatform';
import { SystemCustomizationPanel } from './components/customization/SystemCustomizationPanel';
import { OrgHierarchyView } from './components/employees/OrgHierarchyView';
import { StaffFileManager } from './components/files/StaffFileManager';
import { StaffMemberDashboard } from './components/dashboard/StaffMemberDashboard';
import { AccessRestricted } from './components/access/AccessRestricted';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { FirstLoginChoiceModal } from './components/auth/FirstLoginChoiceModal';
import { MobileInstallPromptModal } from './components/mobile/MobileInstallPromptModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MobileAppSimulator } from './components/MobileAppSimulator';
import { HospitalNoticeBoard } from './components/noticeboard/HospitalNoticeBoard';
import { StaffChatRoom } from './components/chat/StaffChatRoom';
import { BirthdayNotificationBanner } from './components/birthday/BirthdayNotificationBanner';
import { DigitalSuggestionBox } from './components/suggestions/DigitalSuggestionBox';
import { InformationHub } from './components/infohub/InformationHub';
import { QuickActionsFAB } from './components/quickactions/QuickActionsFAB';

const AppContent: React.FC = () => {
  const { isAuthenticated, activeTab, currentUser, activeRole, hasModuleAccess, mobileViewActive, setMobileViewActive } = useHrms();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileInstallPrompt, setShowMobileInstallPrompt] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const isMobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isDismissed = localStorage.getItem('aurahr_dismiss_mobile_install') === 'true';
      const isPromptedThisSession = sessionStorage.getItem('aurahr_mobile_prompted_this_session') === 'true';

      if (isMobile && !isDismissed && !isPromptedThisSession) {
        sessionStorage.setItem('aurahr_mobile_prompted_this_session', 'true');
        const timer = setTimeout(() => {
          setShowMobileInstallPrompt(true);
        }, 900);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isExecRole = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);

  const renderTabContent = () => {
    // RBAC Security Check
    if (!hasModuleAccess(activeRole, currentUser?.id, activeTab)) {
      return <AccessRestricted moduleName={activeTab} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4 sm:space-y-6">
            <BirthdayNotificationBanner />
            {isExecRole ? <ExecutiveDashboard /> : <StaffMemberDashboard />}
          </div>
        );
      case 'notice_board':
        return <HospitalNoticeBoard />;
      case 'staff_chat':
        return <StaffChatRoom />;
      case 'suggestions':
        return <DigitalSuggestionBox />;
      case 'info_hub':
        return <InformationHub />;
      case 'staff_files':
        return <StaffFileManager />;
      case 'customization':
        return <SystemCustomizationPanel />;
      case 'conference':
        return <DepartmentConferencePlatform />;
      case 'employees':
        return <EmployeeDirectory />;
      case 'org_hierarchy':
        return <OrgHierarchyView />;
      case 'credentials':
        return <CredentialTracker />;
      case 'shifts':
        return <ShiftRosterManager />;
      case 'attendance':
        return <BiometricAttendance />;
      case 'leave':
        return <LeaveManagement />;
      case 'payroll':
        return <PayrollProcessor />;
      case 'recruitment':
        return <RecruitmentATS />;
      case 'onboarding':
        return <OnboardingWorkflow />;
      case 'lms':
        return <LearningHub />;
      case 'health':
        return <EmployeeHealthIncidents />;
      case 'grievances':
        return <GrievanceManagement />;
      case 'disciplinary_board':
        return <DisciplinaryBoardManager />;
      case 'performance':
        return <PerformanceManagement />;
      case 'assets':
        return <AssetManager />;
      case 'audit':
        return <AuditLogViewer />;
      case 'reports':
        return <CustomReportsExporter />;
      case 'api':
        return <RestApiBrowser />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation (Desktop Persistent + Mobile Drawer) */}
      <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area Container */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 w-full">
        {/* Header Bar with Hamburger Menu Toggle */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onOpenAIAssistant={() => setIsAiModalOpen(true)}
          onChangePasswordClick={() => setIsChangePasswordOpen(true)}
        />

        {/* Scrollable View Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 min-w-0 w-full">
          <div className="mx-auto max-w-7xl min-w-0 w-full">{renderTabContent()}</div>
        </main>
      </div>

      {/* Modals & Simulators */}
      <AIAssistantModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
      {mobileViewActive && <MobileAppSimulator onClose={() => setMobileViewActive(false)} />}
      
      {/* First Time Login Choice Modal */}
      <FirstLoginChoiceModal
        isOpen={currentUser?.mustChangePassword === true}
        onClose={() => {}}
      />

      {/* Manual Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen && currentUser?.mustChangePassword !== true}
        onClose={() => setIsChangePasswordOpen(false)}
        isMandatory={false}
      />

      {/* Mobile Web App Install Prompt Modal */}
      <MobileInstallPromptModal
        isOpen={showMobileInstallPrompt}
        onClose={() => setShowMobileInstallPrompt(false)}
      />

      {/* Floating Action Button (FAB) for Quick Hospital HR Actions */}
      <QuickActionsFAB />
    </div>
  );
};

export default function App() {
  return (
    <HrmsProvider>
      <AppContent />
    </HrmsProvider>
  );
}
