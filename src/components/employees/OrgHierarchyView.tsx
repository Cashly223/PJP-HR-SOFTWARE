import React, { useState, useMemo } from 'react';
import {
  GitFork,
  Users,
  Crown,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Pencil,
  CheckCircle2,
  UserCheck,
  Building2,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Mail,
  Phone,
  Award,
  ArrowRight,
  Briefcase,
  X,
  User,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee } from '../../types/hrms';

interface TreeNodeProps {
  employee: Employee;
  allEmployees: Employee[];
  depth: number;
  onSelectEmployee: (emp: Employee) => void;
  expandedNodes: Record<string, boolean>;
  toggleNodeExpand: (id: string) => void;
}

const TreeNodeCard: React.FC<TreeNodeProps> = ({
  employee,
  allEmployees,
  depth,
  onSelectEmployee,
  expandedNodes,
  toggleNodeExpand,
}) => {
  const directReports = useMemo(() => {
    return allEmployees.filter((e) => e.managerId === employee.id);
  }, [allEmployees, employee.id]);

  const isExpanded = expandedNodes[employee.id] !== false; // Default expanded
  const hasReports = directReports.length > 0;

  // Role style tags
  const getRoleBadge = (role: string, jobTitle: string) => {
    if (role === 'super_admin' || role === 'facility_head' || jobTitle.toLowerCase().includes('chief') || jobTitle.toLowerCase().includes('head')) {
      return { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'Executive Leader', icon: Crown };
    }
    if (role === 'hr_director' || role === 'hr_manager' || role === 'dept_head') {
      return { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', label: 'Department Head', icon: ShieldCheck };
    }
    if (role === 'unit_head' || jobTitle.toLowerCase().includes('charge') || jobTitle.toLowerCase().includes('lead')) {
      return { bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20', label: 'Unit Head / Lead', icon: UserCheck };
    }
    return { bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', label: 'Staff Member', icon: User };
  };

  const badgeInfo = getRoleBadge(employee.role, employee.jobTitle);
  const BadgeIcon = badgeInfo.icon;

  return (
    <div className="flex flex-col items-center">
      {/* Node Box */}
      <div
        className={`group relative flex w-72 flex-col rounded-2xl border bg-white p-4 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${
          badgeInfo.label === 'Executive Leader'
            ? 'border-amber-500/40 ring-1 ring-amber-500/20'
            : badgeInfo.label === 'Department Head'
            ? 'border-indigo-500/40'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Header Ribbon / Badge */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${badgeInfo.bg}`}>
            <BadgeIcon className="h-3 w-3" />
            {badgeInfo.label}
          </span>
          <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {employee.empCode}
          </span>
        </div>

        {/* Employee Info */}
        <div className="flex items-start gap-3">
          <div className="relative">
            <img
              src={employee.photo}
              alt={employee.firstName}
              className="h-12 w-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
            />
            {hasReports && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow">
                {directReports.length}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="truncate text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {employee.firstName} {employee.lastName}
            </h4>
            <p className="truncate text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              {employee.jobTitle}
            </p>
            <p className="truncate text-[10px] text-slate-400">
              {employee.department} {employee.unit ? `• ${employee.unit}` : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <button
            onClick={() => onSelectEmployee(employee)}
            className="flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Hierarchy Card <ArrowUpRight className="h-3 w-3" />
          </button>

          {hasReports && (
            <button
              onClick={() => toggleNodeExpand(employee.id)}
              className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Collapse
                </>
              ) : (
                <>
                  <ChevronRight className="h-3.5 w-3.5" /> {directReports.length} Direct Reports
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Vertical Connecting Stem to Children */}
      {hasReports && isExpanded && (
        <div className="flex flex-col items-center">
          <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-700"></div>

          {/* Children Row Container */}
          <div className="relative flex gap-8 pt-2">
            {/* Horizontal Branch Bar linking all children */}
            {directReports.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-slate-300 dark:bg-slate-700"
                style={{
                  left: 'calc(18rem / 2)',
                  right: 'calc(18rem / 2)',
                }}
              ></div>
            )}

            {/* Recursive Render Children */}
            {directReports.map((child) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Vertical Stem down to each Child */}
                <div className="h-4 w-0.5 bg-slate-300 dark:bg-slate-700 -mt-2"></div>
                <TreeNodeCard
                  employee={child}
                  allEmployees={allEmployees}
                  depth={depth + 1}
                  onSelectEmployee={onSelectEmployee}
                  expandedNodes={expandedNodes}
                  toggleNodeExpand={toggleNodeExpand}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OrgHierarchyView: React.FC = () => {
  const { employees, updateEmployee, departmentLeadership, activeRole } = useHrms();

  const [viewMode, setViewMode] = useState<'tree' | 'department_matrix' | 'table'>('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Zoom & Pan Canvas state for Visual Tree
  const [zoomLevel, setZoomLevel] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const toggleNodeExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const handleExpandAll = () => {
    setExpandedNodes({});
  };

  const handleCollapseAll = () => {
    const collapsedMap: Record<string, boolean> = {};
    employees.forEach((e) => {
      collapsedMap[e.id] = false;
    });
    setExpandedNodes(collapsedMap);
  };

  // Find root employees (Employees with NO manager assigned, or assigned to top facility head)
  const rootEmployees = useMemo(() => {
    // If an employee has no managerId or their managerId doesn't exist, they are top roots
    const validEmpIds = new Set(employees.map((e) => e.id));
    return employees.filter((e) => !e.managerId || !validEmpIds.has(e.managerId));
  }, [employees]);

  // Handle reassigning manager
  const handleReassignManager = (employeeId: string, newManagerId: string) => {
    if (employeeId === newManagerId) return;

    updateEmployee(employeeId, { managerId: newManagerId || undefined });

    const emp = employees.find((e) => e.id === employeeId);
    const newMgr = employees.find((e) => e.id === newManagerId);

    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
    const mgrName = newMgr ? `${newMgr.firstName} ${newMgr.lastName}` : 'Top Executive Leadership';

    showToast(`Updated Reporting Chain: ${empName} now reports to ${mgrName}`);

    if (selectedEmployee && selectedEmployee.id === employeeId) {
      setSelectedEmployee({
        ...selectedEmployee,
        managerId: newManagerId || undefined,
      });
    }
  };

  // Compute stats
  const totalEmployees = employees.length;
  const managersCount = useMemo(() => {
    const managerSet = new Set(employees.map((e) => e.managerId).filter(Boolean));
    return managerSet.size;
  }, [employees]);

  const avgSpanOfControl = managersCount > 0 ? (totalEmployees / managersCount).toFixed(1) : '0';

  const unassignedManagerCount = useMemo(() => {
    return employees.filter((e) => !e.managerId && e.role !== 'facility_head' && e.role !== 'super_admin').length;
  }, [employees]);

  // Filtered employees for matrix / table
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch = `${e.firstName} ${e.lastName} ${e.empCode} ${e.jobTitle} ${e.department}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'All' || e.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, deptFilter]);

  // Unique departments
  const uniqueDepartments = useMemo(() => {
    const depts = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);
    return depts;
  }, [employees]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Banner */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl dark:border-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5" /> Interactive Org Chart
              </span>
              <span className="text-slate-400 text-xs">• Direct Reporting Chains & Supervision</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Organizational Hierarchy & Reporting Structure
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Visualize multi-tier hospital reporting chains, manager-employee relationships, span of control metrics, and department unit leadership trees.
            </p>
          </div>

          {/* Metrics summary badges */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">TOTAL STAFF</span>
              <span className="text-lg font-black text-white">{totalEmployees}</span>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block">SUPERVISORS</span>
              <span className="text-lg font-black text-indigo-400">{managersCount}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 font-bold block">SPAN OF CONTROL</span>
              <span className="text-lg font-black text-emerald-400">{avgSpanOfControl} <span className="text-[10px] font-normal text-slate-400">/ mgr</span></span>
            </div>
          </div>
        </div>

        {/* View Switcher & Controls Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                viewMode === 'tree' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitFork className="h-4 w-4" /> Visual Tree Diagram
            </button>

            <button
              onClick={() => setViewMode('department_matrix')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                viewMode === 'department_matrix' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" /> Department & Unit Matrix
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                viewMode === 'table' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" /> Manager Assignment Table
            </button>
          </div>

          {/* Quick Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee or manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 sm:w-64 rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none"
            >
              <option value="All">All Departments</option>
              {uniqueDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: VISUAL TREE CANVAS */}
      {viewMode === 'tree' && (
        <div className="relative rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-6 shadow-inner overflow-hidden min-h-[600px]">
          {/* Canvas Controls Toolbar */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 p-2 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur text-xs font-bold">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.5))}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="font-mono text-[11px] text-slate-500 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.5))}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-800 pl-3"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

            <button
              onClick={handleExpandAll}
              className="px-2.5 py-1 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-600/20"
            >
              Expand All
            </button>
            <button
              onClick={handleCollapseAll}
              className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300"
            >
              Collapse
            </button>
          </div>

          {/* Scrollable Tree Container */}
          <div className="overflow-x-auto overflow-y-auto pt-10 pb-16 flex justify-center min-w-max transition-transform duration-200 origin-top" style={{ transform: `scale(${zoomLevel})` }}>
            <div className="flex gap-12">
              {rootEmployees.map((rootEmp) => (
                <TreeNodeCard
                  key={rootEmp.id}
                  employee={rootEmp}
                  allEmployees={employees}
                  depth={0}
                  onSelectEmployee={(emp) => setSelectedEmployee(emp)}
                  expandedNodes={expandedNodes}
                  toggleNodeExpand={toggleNodeExpand}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DEPARTMENT & UNIT MATRIX */}
      {viewMode === 'department_matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {uniqueDepartments.map((deptName) => {
            const deptStaff = employees.filter((e) => e.department === deptName);
            const deptHead = deptStaff.find(
              (e) => e.role === 'dept_head' || e.jobTitle.toLowerCase().includes('head') || e.jobTitle.toLowerCase().includes('chief')
            );

            // Group by unit
            const unitsMap: Record<string, Employee[]> = {};
            deptStaff.forEach((emp) => {
              const u = emp.unit || 'General Department Staff';
              if (!unitsMap[u]) unitsMap[u] = [];
              unitsMap[u].push(emp);
            });

            return (
              <div
                key={deptName}
                className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm overflow-hidden space-y-4"
              >
                {/* Department Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        {deptName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {deptStaff.length} Staff Members • {Object.keys(unitsMap).length} Operational Units
                      </p>
                    </div>
                  </div>

                  {deptHead && (
                    <div className="text-right">
                      <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block">HOD</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {deptHead.firstName} {deptHead.lastName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Units List */}
                <div className="space-y-3">
                  {Object.entries(unitsMap).map(([unitName, unitStaff]) => (
                    <div
                      key={unitName}
                      className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-cyan-500" />
                          {unitName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {unitStaff.length} Staff
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {unitStaff.map((emp) => {
                          const mgr = employees.find((m) => m.id === emp.managerId);
                          return (
                            <div
                              key={emp.id}
                              onClick={() => setSelectedEmployee(emp)}
                              className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition shadow-xs"
                            >
                              <img
                                src={emp.photo}
                                alt={emp.firstName}
                                className="h-8 w-8 rounded-lg object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                  {emp.firstName} {emp.lastName}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {emp.jobTitle}
                                </p>
                                {mgr && (
                                  <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-medium truncate">
                                    Reports to: {mgr.firstName} {mgr.lastName}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: MANAGER ASSIGNMENT TABLE */}
      {viewMode === 'table' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Direct Supervisor & Manager Assignment Table
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure supervisor links for all hospital personnel. Direct reports dictate approval escalation routing.
              </p>
            </div>

            {unassignedManagerCount > 0 && (
              <span className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                {unassignedManagerCount} Staff Pending Supervisor Assignment
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Employee / Staff Member</th>
                  <th className="p-4">Staff ID</th>
                  <th className="p-4">Department & Unit</th>
                  <th className="p-4">Assigned Direct Supervisor (Reports To)</th>
                  <th className="p-4">Direct Reports Count</th>
                  <th className="p-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((emp) => {
                  const directReportsCount = employees.filter((e) => e.managerId === emp.id).length;
                  const currentManager = employees.find((m) => m.id === emp.managerId);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.photo}
                            alt={emp.firstName}
                            className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {emp.jobTitle}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {emp.empCode}
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.department}</p>
                        <p className="text-[10px] text-slate-400">{emp.unit || 'General'}</p>
                      </td>

                      <td className="p-4">
                        <select
                          value={emp.managerId || ''}
                          onChange={(e) => handleReassignManager(emp.id, e.target.value)}
                          className={`w-full max-w-xs rounded-xl border p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            emp.managerId
                              ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                              : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <option value="">No Manager (Top Executive Level)</option>
                          {employees
                            .filter((m) => m.id !== emp.id)
                            .map((mgr) => (
                              <option key={mgr.id} value={mgr.id}>
                                {mgr.firstName} {mgr.lastName} — {mgr.jobTitle} ({mgr.department})
                              </option>
                            ))}
                        </select>
                      </td>

                      <td className="p-4">
                        {directReportsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {directReportsCount} Direct Reports
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">0 Direct Reports</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white transition"
                        >
                          Hierarchy Card
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPLOYEE HIERARCHY CARD DRAWER / MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-6 text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedEmployee.photo}
                  alt={selectedEmployee.firstName}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h3>
                    <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400">
                      {selectedEmployee.empCode}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedEmployee.jobTitle}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedEmployee.department} • {selectedEmployee.unit || 'Main Unit'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Reporting Chain Breadcrumbs */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5 text-emerald-500" /> Full Upward Escalation Chain
              </span>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Hospital Facility Head</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-indigo-600 dark:text-indigo-400">{selectedEmployee.department} HOD</span>
                {selectedEmployee.managerId && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-cyan-600 dark:text-cyan-400">
                      {employees.find((m) => m.id === selectedEmployee.managerId)?.firstName}{' '}
                      {employees.find((m) => m.id === selectedEmployee.managerId)?.lastName}
                    </span>
                  </>
                )}
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold underline">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </span>
              </div>
            </div>

            {/* Change Direct Manager Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Reassign Direct Reporting Manager
              </label>
              <select
                value={selectedEmployee.managerId || ''}
                onChange={(e) => handleReassignManager(selectedEmployee.id, e.target.value)}
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs font-semibold"
              >
                <option value="">No Manager (Reports directly to Top Leadership)</option>
                {employees
                  .filter((e) => e.id !== selectedEmployee.id)
                  .map((mgr) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.firstName} {mgr.lastName} — {mgr.jobTitle} ({mgr.department})
                    </option>
                  ))}
              </select>
            </div>

            {/* Direct Reports Under This Employee */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Direct Team Members ({employees.filter((e) => e.managerId === selectedEmployee.id).length})</span>
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {employees.filter((e) => e.managerId === selectedEmployee.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center">
                    No direct reports assigned to this employee.
                  </p>
                ) : (
                  employees
                    .filter((e) => e.managerId === selectedEmployee.id)
                    .map((report) => (
                      <div
                        key={report.id}
                        onClick={() => setSelectedEmployee(report)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={report.photo}
                            alt={report.firstName}
                            className="h-8 w-8 rounded-xl object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold">
                              {report.firstName} {report.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {report.jobTitle} • {report.department}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-500">
                          {report.empCode}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
              >
                Close Hierarchy Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
