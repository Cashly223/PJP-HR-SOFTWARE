import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  User,
  Building,
  Plus,
  Trash2,
  X,
  FileText,
  HelpCircle,
  Award,
} from 'lucide-react';
import { LeaveRequest } from '../../types/hrms';
import {
  STATUTORY_PUBLIC_HOLIDAYS,
  PublicHoliday,
  getPublicHolidaysInRange,
  calculateHolidayAdjustedEndDate,
  calculateResumptionDate,
  calculateLeaveDays,
  generateHolidayAdjustmentRemarks,
  parseDateParts,
  formatDateParts,
  isMaternityLeave,
} from '../../lib/leaveUtils';

interface AdjustLeaveHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  onSaveAdjustment: (data: {
    newEndDate: string;
    remarks: string;
    holidaysCount: number;
    holidayNames: string[];
    newResumptionDate: string;
    originalEndDate: string;
    adjustedBy?: string;
  }) => void;
  currentUserName?: string;
}

export const AdjustLeaveHolidayModal: React.FC<AdjustLeaveHolidayModalProps> = ({
  isOpen,
  onClose,
  leave,
  onSaveAdjustment,
  currentUserName = 'HR Directorate',
}) => {
  if (!isOpen || !leave) return null;

  const originalEndDate = leave.originalEndDate || leave.endDate;
  const originalResumptionDate =
    leave.originalResumptionDate ||
    leave.dateOfResumption ||
    calculateResumptionDate(originalEndDate);

  // Custom added holidays by HR
  const [customHolidays, setCustomHolidays] = useState<PublicHoliday[]>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomDate, setNewCustomDate] = useState('');

  // Selected holiday dates to compensate
  const [selectedHolidayDates, setSelectedHolidayDates] = useState<string[]>(
    leave.holidayNames && leave.holidayNames.length > 0
      ? STATUTORY_PUBLIC_HOLIDAYS.filter((h) =>
          leave.holidayNames?.includes(h.name)
        ).map((h) => h.date)
      : []
  );

  // Adjustment mode
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  // Manual values
  const [manualEndDate, setManualEndDate] = useState(leave.endDate || originalEndDate);
  const [manualResumptionDate, setManualResumptionDate] = useState(
    leave.dateOfResumption || calculateResumptionDate(manualEndDate)
  );

  // Remarks & Adjuster
  const [remarks, setRemarks] = useState(
    leave.hrAdjustmentRemarks ||
      leave.hrRemarks ||
      ''
  );
  const [adjustedByName, setAdjustedByName] = useState(
    leave.adjustedByHrName || currentUserName || 'HR Management Directorate'
  );

  // Calculate search window: from start date to 60 days after start date
  const searchWindowEnd = useMemo(() => {
    if (!leave.startDate) return originalEndDate;
    const parts = parseDateParts(leave.startDate);
    if (!parts) return originalEndDate;
    const d = new Date(parts.year, parts.month - 1, parts.day);
    d.setDate(d.getDate() + 90);
    return formatDateParts(d);
  }, [leave.startDate, originalEndDate]);

  // Detected public holidays in this window
  const detectedHolidays = useMemo(() => {
    return getPublicHolidaysInRange(leave.startDate, searchWindowEnd, customHolidays);
  }, [leave.startDate, searchWindowEnd, customHolidays]);

  // Detected holidays strictly inside original date range
  const holidaysInOriginalRange = useMemo(() => {
    return getPublicHolidaysInRange(leave.startDate, originalEndDate, customHolidays);
  }, [leave.startDate, originalEndDate, customHolidays]);

  // Initialize selected holiday dates on modal open
  useEffect(() => {
    if (holidaysInOriginalRange.length > 0 && selectedHolidayDates.length === 0) {
      const weekdayHolidayDates = holidaysInOriginalRange
        .filter((h) => h.isWeekday)
        .map((h) => h.date);
      setSelectedHolidayDates(weekdayHolidayDates);
    }
  }, [holidaysInOriginalRange]);

  // Compute calculated end date & resumption date based on selected holidays
  const calculatedResult = useMemo(() => {
    return calculateHolidayAdjustedEndDate(
      leave.startDate,
      leave.totalDays,
      leave.leaveType,
      selectedHolidayDates
    );
  }, [leave.startDate, leave.totalDays, leave.leaveType, selectedHolidayDates]);

  // Effective new end date and resumption date
  const effectiveEndDate = mode === 'auto' ? calculatedResult.newEndDate : manualEndDate;
  const effectiveResumptionDate =
    mode === 'auto'
      ? calculatedResult.newResumptionDate
      : manualResumptionDate || calculateResumptionDate(manualEndDate);

  // Selected holiday names list
  const selectedHolidayNames = useMemo(() => {
    const all = [...STATUTORY_PUBLIC_HOLIDAYS, ...customHolidays];
    return selectedHolidayDates
      .map((d) => all.find((h) => h.date === d)?.name)
      .filter(Boolean) as string[];
  }, [selectedHolidayDates, customHolidays]);

  // Auto update generated remarks when dates or holidays change if not manually overwritten
  useEffect(() => {
    if (!remarks || remarks.includes('HR End Date Adjustment:')) {
      const autoRemark = generateHolidayAdjustmentRemarks(
        leave.employeeName,
        originalEndDate,
        effectiveEndDate,
        selectedHolidayNames
      );
      setRemarks(autoRemark);
    }
  }, [effectiveEndDate, originalEndDate, selectedHolidayNames]);

  const handleToggleHoliday = (date: string) => {
    setSelectedHolidayDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleAddCustomHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomDate || !newCustomName.trim()) return;
    const item: PublicHoliday = {
      date: newCustomDate,
      name: newCustomName.trim(),
      description: 'Custom / Declared Non-Working Day',
    };
    setCustomHolidays((prev) => [...prev, item]);
    setSelectedHolidayDates((prev) => [...prev, newCustomDate]);
    setNewCustomName('');
    setNewCustomDate('');
  };

  const handleManualEndDateChange = (newDate: string) => {
    setManualEndDate(newDate);
    setManualResumptionDate(calculateResumptionDate(newDate));
  };

  const handleApplyQuickDays = (extraDays: number) => {
    if (!manualEndDate) return;
    const parts = parseDateParts(manualEndDate);
    if (!parts) return;
    const d = new Date(parts.year, parts.month - 1, parts.day);
    d.setDate(d.getDate() + extraDays);
    const updatedStr = formatDateParts(d);
    setManualEndDate(updatedStr);
    setManualResumptionDate(calculateResumptionDate(updatedStr));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSaveAdjustment({
      newEndDate: effectiveEndDate,
      remarks: remarks.trim() || `HR End Date Adjustment for Public Holidays (${effectiveEndDate}).`,
      holidaysCount: selectedHolidayDates.length,
      holidayNames: selectedHolidayNames,
      newResumptionDate: effectiveResumptionDate,
      originalEndDate,
      adjustedBy: adjustedByName.trim(),
    });

    onClose();
  };

  const isExtended = effectiveEndDate !== originalEndDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Public Holiday Adjustment
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  HR Directorate Governance
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Adjust Leave End Date for Public Holidays
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Extend leave completion and resumption dates to compensate for statutory public holidays affecting approved leave days.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Employee & Current Leave Summary Card */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-sm">
                  {leave.employeeName.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {leave.employeeName}
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      ({leave.staffId || leave.employeeId})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{leave.grade || 'Clinical Staff'}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {leave.department} {leave.unit ? `(${leave.unit})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="self-start sm:self-center">
                <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold text-[11px]">
                  {leave.leaveType} ({leave.totalDays} Working Days)
                </span>
              </div>
            </div>

            {/* Current Dates Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {leave.startDate}
                </span>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                  {leave.isHolidayAdjusted ? 'Previous End Date' : 'Original End Date'}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {originalEndDate}
                </span>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Original Resumption</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {originalResumptionDate}
                </span>
              </div>

              <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 p-2.5 border border-emerald-500/30">
                <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  Leave Entitlement Days
                </span>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {leave.totalDays} Days
                </span>
              </div>
            </div>

            {leave.isHolidayAdjusted && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>
                  This leave was previously adjusted by <strong>{leave.adjustedByHrName || 'HR'}</strong> on {leave.adjustedAt?.slice(0, 10)}. You can re-adjust dates or update remarks below.
                </span>
              </div>
            )}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMode('auto')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                mode === 'auto'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Auto-Detect Public Holidays (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                mode === 'manual'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              Manual End Date & Custom Extension
            </button>
          </div>

          {/* MODE 1: AUTO PUBLIC HOLIDAYS SELECTOR */}
          {mode === 'auto' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-emerald-500" />
                    Statutory Public Holidays in Leave Window
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select the statutory public holidays that fall on working days to automatically push the end date forward.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const weekdayHolidays = detectedHolidays
                      .filter((h) => h.isWeekday)
                      .map((h) => h.date);
                    setSelectedHolidayDates(weekdayHolidays);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20 transition"
                >
                  Select All Weekday Holidays
                </button>
              </div>

              {detectedHolidays.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
                  No statutory public holidays detected in the immediate leave interval. You can still add a custom holiday below or switch to manual end date mode.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {detectedHolidays.map((h) => {
                    const isSelected = selectedHolidayDates.includes(h.date);
                    const isWithinOrigRange =
                      h.date >= leave.startDate && h.date <= originalEndDate;

                    return (
                      <div
                        key={h.date}
                        onClick={() => handleToggleHoliday(h.date)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleHoliday(h.date)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              {h.name}
                              {isWithinOrigRange && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-extrabold">
                                  In Leave Period
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              📅 {h.date} ({h.dayOfWeek}) •{' '}
                              <span className={h.isWeekday ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                                {h.isWeekday ? 'Weekday (Working Day Impacted)' : 'Weekend'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs font-bold ${
                              isSelected
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {isSelected ? '+1 Day Extension' : 'Not Included'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Custom / Declared Public Holiday Form */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-indigo-500" />
                  Add Ad-Hoc / Gazetted Public Holiday or Non-Working Day
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={newCustomDate}
                    onChange={(e) => setNewCustomDate(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-900 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="e.g. Special Ad-Hoc National Holiday"
                    value={newCustomName}
                    onChange={(e) => setNewCustomName(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-xs bg-white dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomHoliday}
                    disabled={!newCustomDate || !newCustomName.trim()}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shrink-0"
                  >
                    Add Holiday
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* MODE 2: MANUAL DATE PICKER & QUICK BUTTONS */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Leave End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={manualEndDate}
                    onChange={(e) => handleManualEndDateChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm"
                  />
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">Quick Extend:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDays(1)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-[10px]"
                    >
                      +1 Day
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDays(2)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-[10px]"
                    >
                      +2 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDays(3)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-[10px]"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualEndDateChange(originalEndDate)}
                      className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-[10px]"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Official Resumption Date
                  </label>
                  <input
                    type="date"
                    required
                    value={manualResumptionDate}
                    onChange={(e) => setManualResumptionDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Standard Rule: Strictly +1 day after the revised Leave End Date.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* COMPUTED RESULT SUMMARY BANNER */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 p-4 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Adjustment Preview & Calculation
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                {isExtended ? 'Leave Extended' : 'Unchanged'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="block text-[10px] text-slate-400 font-bold">REVISED END DATE</span>
                <span className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                  {effectiveEndDate}
                </span>
                {effectiveEndDate !== originalEndDate && (
                  <span className="block text-[10px] text-slate-400 line-through">
                    Was: {originalEndDate}
                  </span>
                )}
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="block text-[10px] text-slate-400 font-bold">NEW RESUMPTION DATE</span>
                <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  {effectiveResumptionDate}
                </span>
                {effectiveResumptionDate !== originalResumptionDate && (
                  <span className="block text-[10px] text-slate-400 line-through">
                    Was: {originalResumptionDate}
                  </span>
                )}
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/20">
                <span className="block text-[10px] text-slate-400 font-bold">PUBLIC HOLIDAYS COMPENSATED</span>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {selectedHolidayDates.length > 0
                    ? `${selectedHolidayDates.length} Holiday(s)`
                    : 'Custom Extension'}
                </span>
                <span className="block text-[10px] text-slate-500 truncate">
                  {selectedHolidayNames.join(', ') || 'No holiday tags'}
                </span>
              </div>
            </div>
          </div>

          {/* HR REMARKS & JUSTIFICATION */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                  Official HR Remarks & Justification
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const autoRemark = generateHolidayAdjustmentRemarks(
                      leave.employeeName,
                      originalEndDate,
                      effectiveEndDate,
                      selectedHolidayNames
                    );
                    setRemarks(autoRemark);
                  }}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Regenerate Standard Template
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="State the reason for end date adjustment (e.g. Public Holidays, Hospital Governance clearance)..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 bg-white dark:bg-slate-800 text-xs font-medium focus:border-indigo-500 focus:outline-none"
              ></textarea>
              <p className="text-[10px] text-slate-400 mt-1">
                These remarks will be permanently recorded in the Leave History, Part C (HR Validation), and the employee's Digital Staff File.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Authorized HR Officer Name / Designation
              </label>
              <input
                type="text"
                required
                value={adjustedByName}
                onChange={(e) => setAdjustedByName(e.target.value)}
                placeholder="e.g. Miss Veronica (HR Officer) / HR Directorate"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-xs font-semibold focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              Save & Apply Holiday Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
