import React from 'react';
import { PackageCheck, Tablet, Shield, KeyRound, Shirt } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const AssetManager: React.FC = () => {
  const { assets } = useHrms();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <PackageCheck className="h-6 w-6 text-emerald-600" />
          Hospital Asset & PPE Tracking Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tracking Clinical Workstation Tablets, Surgical Scrubs, Lead Aprons & RFID Access Badges.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Asset Code</th>
                <th className="px-5 py-3.5">Equipment / Item Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Serial Number</th>
                <th className="px-5 py-3.5">Assigned Doctor / Nurse</th>
                <th className="px-5 py-3.5">Issue Date</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {assets.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4 font-mono font-bold">{ast.assetCode}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{ast.name}</td>
                  <td className="px-5 py-4 text-emerald-600 font-medium">{ast.category}</td>
                  <td className="px-5 py-4 font-mono text-slate-400">{ast.serialNo}</td>
                  <td className="px-5 py-4 font-bold">{ast.assignedTo}</td>
                  <td className="px-5 py-4">{ast.issueDate}</td>
                  <td className="px-5 py-4">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      {ast.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
