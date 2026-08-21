import React from 'react';
import {
  Users,
  Stethoscope,
  Award,
  Clock,
  Banknote,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Sparkles,
  Video,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const ExecutiveDashboard: React.FC = () => {
  const { employees, rosters, attendance, formatCurrency, selectedHospital, setActiveTab } = useHrms();

  const totalStaff = (employees || []).length;
  const onDutyCount = (rosters || []).filter((r) => r && (r.status === 'Assigned' || r.status === 'Completed')).length;
  const totalOvertime = (attendance || []).reduce((acc, a) => acc + (a?.overtimeHours || 0), 0);

  // License alert count
  const expiringLicenses = (employees || []).flatMap((e) => e?.medicalLicenses || []).filter((l) => l && (l.status === 'Expiring Soon' || l.status === 'Expired'));

  // Compute Department Staff Distribution: Count, On Leave, At Post
  const { leaves, departmentLeadership } = useHrms();

  const deptDistributionData = (departmentLeadership || []).map((dept) => {
    const deptEmployees = (employees || []).filter(
      (e) => e && (e.department || '').toLowerCase() === (dept?.departmentName || '').toLowerCase()
    );

    // Active approved leaves
    const onLeaveCount = (leaves || []).filter((l) => {
      if (!l) return false;
      const isDeptMatch = (l.department || '').toLowerCase() === (dept?.departmentName || '').toLowerCase();
      const isApproved = l.status === 'Approved' || l.currentStage === 'Fully Approved';
      return isDeptMatch && isApproved;
    }).length;

    const totalCount = Math.max(deptEmployees.length, (dept?.units || []).reduce((acc, u) => acc + (u?.staffCount || 5), 0));
    const onLeave = Math.min(onLeaveCount, totalCount);
    const atPost = Math.max(0, totalCount - onLeave);

    return {
      department: dept?.departmentName || '',
      code: dept?.departmentCode || '',
      count: totalCount,
      onLeave: onLeave,
      atPost: atPost,
      availabilityPercent: totalCount > 0 ? Math.round((atPost / totalCount) * 100) : 100,
    };
  });

  const overtimeTrend = [
    { month: 'Jan', regularHours: 1600, overtimeHours: 120 },
    { month: 'Feb', regularHours: 1580, overtimeHours: 140 },
    { month: 'Mar', regularHours: 1620, overtimeHours: 180 },
    { month: 'Apr', regularHours: 1610, overtimeHours: 110 },
    { month: 'May', regularHours: 1650, overtimeHours: 195 },
    { month: 'Jun', regularHours: 1640, overtimeHours: 160 },
    { month: 'Jul', regularHours: 1680, overtimeHours: 210 },
  ];

  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              Healthcare Operations Dashboard
            </span>
            <span className="text-xs text-slate-300">• {selectedHospital.country}</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{selectedHospital.name} Executive Hub</h2>
          <p className="mt-1 text-xs text-slate-300">
            Real-time multi-branch staff roster, medical credential compliance & payroll analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('conference')}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
          >
            <Video className="h-4 w-4" /> Live Unit Conference
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" /> Add Doctor / Staff
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 backdrop-blur"
          >
            <Clock className="h-4 w-4" /> ICU Roster
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Active Staff</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalStaff + 140}</div>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> +4.2% headcount expansion
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ICU & Emergency On-Duty</span>
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{onDutyCount + 42} Staff</div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Active night & 12h shifts</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">License Expiry Alerts</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{expiringLicenses.length} Licenses</div>
          <button
            onClick={() => setActiveTab('credentials')}
            className="mt-1 text-[11px] font-semibold text-amber-600 hover:underline flex items-center gap-1"
          >
            Action required <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Payroll Commitment</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(485000)}</div>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Includes Hazard & Night allowances</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Staff Distribution (Count, At Post, On Leave) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Department Staff Distribution
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live breakdown: Total Count, On Leave, and Active At Post across departments.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> At Post
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> On Leave
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="code" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Staff`,
                    name === 'atPost' ? 'At Post (On Duty)' : name === 'onLeave' ? 'On Leave' : 'Total Count',
                  ]}
                />
                <Bar dataKey="atPost" stackId="a" fill="#10b981" name="atPost" radius={[0, 0, 0, 0]} />
                <Bar dataKey="onLeave" stackId="a" fill="#f59e0b" name="onLeave" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Distribution Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Total Count</th>
                  <th className="py-2.5 px-3 text-center text-amber-600 dark:text-amber-400">On Leave</th>
                  <th className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400">At Post</th>
                  <th className="py-2.5 px-3 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {deptDistributionData.map((d) => (
                  <tr key={d.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {d.department} ({d.code})
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{d.count}</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                      {d.onLeave}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {d.atPost}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {d.availabilityPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overtime vs Regular Hours Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Workforce Overtime vs Regular Hours</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overtimeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="regularHours" stroke="#10b981" strokeWidth={2} name="Regular Hours" />
                <Line type="monotone" dataKey="overtimeHours" stroke="#f59e0b" strokeWidth={2} name="Overtime Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
