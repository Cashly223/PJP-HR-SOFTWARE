import React, { useState } from 'react';
import { UserPlus, Shield, KeyRound, Lock, CheckCircle2, AlertCircle, X, Sparkles, Building2, Briefcase, Mail, User } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { UserRole } from '../../types/hrms';

interface CreateStaffAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStaffAccountModal: React.FC<CreateStaffAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createStaffAccountByHR } = useHrms();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [department, setDepartment] = useState('Cardiology & Intensive Care');
  const [jobTitle, setJobTitle] = useState('Consultant Cardiologist');
  const [defaultPassword, setDefaultPassword] = useState('Hospital2026!');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and hospital email address are required.');
      return;
    }

    setIsLoading(true);
    try {
      const created = await createStaffAccountByHR({
        firstName,
        lastName,
        email,
        role,
        department,
        jobTitle,
        defaultPassword,
      });

      setSuccessMsg(`Staff account created for ${created.firstName} ${created.lastName}! Staff ID: ${created.empCode}. Default password: ${defaultPassword}`);
      setTimeout(() => {
        onClose();
        setFirstName('');
        setLastName('');
        setEmail('');
        setSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Error provisioning staff account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-sans">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              HR Staff Account Provisioning
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                HR Sole Auth
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Staff accounts are created solely by HR officers. Generates initial credentials & forces password change on first sign-in.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">First Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Kwame"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Last Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Mensah"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Hospital Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="k.mensah@stjudehealth.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Clinical Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="doctor">Doctor / Physician</option>
                <option value="nurse">Nurse / Healthcare Staff</option>
                <option value="dept_head">Department Head (HOD)</option>
                <option value="unit_head">Unit Head (HOU)</option>
                <option value="hr_manager">HR Manager</option>
                <option value="hr_director">HR Director</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Cardiology & Intensive Care">Cardiology & ICU</option>
                <option value="Emergency & Trauma">Emergency & Trauma</option>
                <option value="Surgical Services & OT">Surgical Services</option>
                <option value="Human Resources & Workforce">Human Resources</option>
                <option value="Pediatrics & Child Health">Pediatrics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior ICU Specialist"
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">HR Default Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 text-xs text-amber-400 font-mono font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Upon creation, the staff member will be required to change this default password upon their initial login.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Provision Staff Account & Assign Password</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
