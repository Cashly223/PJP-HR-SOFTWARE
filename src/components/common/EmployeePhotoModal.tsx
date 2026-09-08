import React, { useState } from 'react';
import { X, Camera, Check, Save } from 'lucide-react';
import { EmployeePhotoUploader } from './EmployeePhotoUploader';
import { Employee } from '../../types/hrms';

interface EmployeePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSavePhoto: (newPhotoUrl: string) => void;
}

export const EmployeePhotoModal: React.FC<EmployeePhotoModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSavePhoto,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(employee.photo || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePhoto(selectedPhoto);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">
                Update Employee Photo
              </h3>
              <p className="text-xs text-slate-400">
                {employee.firstName} {employee.lastName} ({employee.empCode}) • {employee.jobTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Uploader Core Component */}
        <EmployeePhotoUploader
          currentPhoto={selectedPhoto}
          employeeName={`${employee.firstName} ${employee.lastName}`}
          gender={employee.gender}
          onPhotoChange={(newPhoto) => setSelectedPhoto(newPhoto)}
          title="Upload or Capture Staff Photo"
          subtitle="File upload with auto-compression, live camera snapshot, or clinical presets"
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Photo Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
