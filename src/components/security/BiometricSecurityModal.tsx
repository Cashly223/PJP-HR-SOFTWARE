import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  Smartphone,
  Laptop,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  KeyRound,
  RefreshCw,
  Clock,
  Shield,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import {
  getDeviceBiometricCapabilities,
  getEnrolledPasskeys,
  deleteEnrolledPasskey,
  registerWebAuthnPasskey,
  authenticateWithWebAuthn,
  EnrolledPasskey,
} from '../../utils/webAuthnService';

interface BiometricSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BiometricSecurityModal: React.FC<BiometricSecurityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useHrms();

  const [capabilities, setCapabilities] = useState<{
    supported: boolean;
    platformAvailable: boolean;
    sensorName: string;
    sensorType: 'fingerprint' | 'facial' | 'passkey';
    isMobile: boolean;
  }>({
    supported: true,
    platformAvailable: true,
    sensorName: 'Checking biometric hardware...',
    sensorType: 'fingerprint',
    isMobile: false,
  });

  const [passkeys, setPasskeys] = useState<EnrolledPasskey[]>([]);
  const [deviceLabelInput, setDeviceLabelInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    getDeviceBiometricCapabilities().then((caps) => {
      setCapabilities(caps);
      setDeviceLabelInput(caps.sensorName);
    });

    loadKeys();
    setStatusMessage(null);
  }, [isOpen, currentUser]);

  const loadKeys = () => {
    if (!currentUser) return;
    const all = getEnrolledPasskeys(currentUser.empCode || currentUser.email);
    setPasskeys(all);
  };

  if (!isOpen) return null;

  const handleRegisterCurrentDevice = async () => {
    if (!currentUser) return;

    setIsProcessing(true);
    setStatusMessage({ text: 'Contacting local biometric sensor via Web Authentication API...', type: 'info' });

    try {
      const newKey = await registerWebAuthnPasskey({
        staffCode: currentUser.empCode || 'PJ-STAFF',
        staffName: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department || 'Clinical Healthcare Services',
        customLabel: deviceLabelInput || capabilities.sensorName,
      });

      loadKeys();
      setIsProcessing(false);
      setStatusMessage({
        text: `Device biometric passkey (${newKey.deviceLabel}) registered successfully!`,
        type: 'success',
      });
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage({
        text: err.message || 'Failed to complete biometric passkey registration.',
        type: 'error',
      });
    }
  };

  const handleTestBiometrics = async () => {
    setIsProcessing(true);
    setStatusMessage({ text: 'Please touch your fingerprint sensor or verify with Face ID...', type: 'info' });

    try {
      const result = await authenticateWithWebAuthn({
        targetStaffCode: currentUser?.empCode || currentUser?.email,
      });

      setIsProcessing(false);
      if (result.success) {
        setStatusMessage({
          text: `Biometric sensor test passed! Authenticated with ${result.sensorName} (${result.confidenceScore}% confidence score).`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: result.error || 'Biometric sensor test was not completed.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage({
        text: err.message || 'Error occurred while testing biometric sensor.',
        type: 'error',
      });
    }
  };

  const handleDeletePasskey = (id: string, label: string) => {
    deleteEnrolledPasskey(id);
    loadKeys();
    setStatusMessage({
      text: `Removed passkey "${label}". Staff member will need to re-enroll their biometric before using one-touch sign in again.`,
      type: 'info',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Fingerprint className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Biometric & Passkey Access Manager</h3>
              <p className="text-xs text-slate-400">WebAuthn / FIDO2 Passwordless Institutional Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              ) : (
                <RefreshCw className="h-4 w-4 shrink-0 text-blue-400 mt-0.5 animate-spin" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Current Device Sensor Status */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {capabilities.isMobile ? (
                <Smartphone className="h-5 w-5 text-emerald-400" />
              ) : (
                <Laptop className="h-5 w-5 text-emerald-400" />
              )}
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Current Hardware: {capabilities.sensorName}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[11px] text-slate-400">
                  Web Authentication API v2 • Elliptic Curve Cryptography (ECDSA P-256)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestBiometrics}
              disabled={isProcessing}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
            >
              Test Sensor
            </button>
          </div>

          {/* Register Current Device Passkey */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-emerald-950/30 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <KeyRound className="h-4 w-4 text-emerald-400" />
              <span>Enroll This Hardware Device</span>
            </div>
            <p className="text-xs text-slate-300">
              Link your device's physical Touch ID, Face ID, or Windows Hello sensor to your staff account for instant, zero-password sign-in.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={deviceLabelInput}
                onChange={(e) => setDeviceLabelInput(e.target.value)}
                placeholder="e.g. Personal iPhone 15 Pro, Ward 3 Tablet"
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleRegisterCurrentDevice}
                disabled={isProcessing}
                className="w-full sm:w-auto shrink-0 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>Enroll Biometrics</span>
              </button>
            </div>
          </div>

          {/* List of Registered Passkeys for this User */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Authenticators for {currentUser?.name} ({passkeys.length})
            </h4>

            {passkeys.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                No biometric passkeys enrolled yet. Click "Enroll Biometrics" above to set up one-touch login on this device.
              </div>
            ) : (
              <div className="space-y-2">
                {passkeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Fingerprint className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{key.deviceLabel}</span>
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {key.algorithm}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Enrolled: {new Date(key.enrolledAt).toLocaleDateString()}
                          </span>
                          {key.lastUsedAt && (
                            <span>• Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePasskey(key.id, key.deviceLabel)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Revoke passkey"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zero Buddy-Punching Security Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400">
              <strong className="text-slate-200">Hardware-Protected Security: </strong>
              WebAuthn private keys never leave your physical device's Secure Enclave or Trusted Execution Environment (TEE). Biometric scans cannot be spoofed, shared, or transferred between staff.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Hospital IT Directorate Approved</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
