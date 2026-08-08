import React, { useState } from 'react';
import { HrmsProvider, useHrms } from './context/HrmsContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
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
import { PerformanceManagement } from './components/performance/PerformanceManagement';
import { AssetManager } from './components/assets/AssetManager';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { CustomReportsExporter } from './components/reports/CustomReportsExporter';
import { RestApiBrowser } from './components/api/RestApiBrowser';
import { DepartmentConferencePlatform } from './components/conference/DepartmentConferencePlatform';
import { SystemCustomizationPanel } from './components/customization/SystemCustomizationPanel';
import { OrgHierarchyView } from './components/employees/OrgHierarchyView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MobileAppSimulator } from './components/MobileAppSimulator';

const AppContent: React.FC = () => {
  const { activeTab, isAiModalOpen, setIsAiModalOpen, isMobileSimOpen, setIsMobileSimOpen } = useHrms();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <Header />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl">{renderTabContent()}</div>
        </main>
      </div>

      {/* Modals & Simulators */}
      <AIAssistantModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
      {isMobileSimOpen && <MobileAppSimulator onClose={() => setIsMobileSimOpen(false)} />}
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
