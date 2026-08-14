import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PjpiimcLogo } from '../common/PjpiimcLogo';

interface MobileInstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallPromptModal: React.FC<MobileInstallPromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      onClose();
    } else {
      // If native prompt unavailable, keep modal open to show instructions
    }
  };

  const handleDismissForever = () => {
    localStorage.setItem('aurahr_dismiss_mobile_install', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-900 shadow-2xl text-slate-100 animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 shadow-inner shrink-0">
              <PjpiimcLogo size="md" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-200 block">
                Mobile Web App Experience
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Install PJPIIMC Mobile App
              </h3>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-100/90 leading-relaxed relative z-10">
            Add the hospital portal to your phone's home screen for fast 1-tap biometric access, instant shift notifications, and offline duty roster access.
          </p>

          {/* Decorative Sparkle Blobs */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Quick Perks */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Instant 1-Tap Launch</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Biometric Sign-In</span>
            </div>
          </div>

          {/* Installation Instructions */}
          {deferredPrompt ? (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Native App Install Ready</p>
                <p className="text-[11px] text-blue-300">Click below to install directly to your device.</p>
              </div>
            </div>
          ) : isIOS ? (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Share2 className="h-4 w-4 text-blue-400" /> Install on iPhone / iPad (Safari):
              </p>
              <ol className="space-y-2 text-[11px] list-decimal list-inside text-slate-300">
                <li>
                  Tap the <strong className="text-white">Share</strong> button (box with arrow <Share2 className="inline h-3 w-3 text-blue-400" />) at the bottom of Safari.
                </li>
                <li>
                  Scroll down and select <strong className="text-white">"Add to Home Screen"</strong> (<PlusSquare className="inline h-3 w-3 text-blue-400" />).
                </li>
                <li>
                  Tap <strong className="text-white">"Add"</strong> in the top right to create the PJPIIMC app icon!
                </li>
              </ol>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Smartphone className="h-4 w-4 text-blue-400" /> Install on Android (Chrome):
              </p>
              <ol className="space-y-2 text-[11px] list-decimal list-inside text-slate-300">
                <li>
                  Tap the <strong className="text-white">Three Dots (⋮)</strong> menu in the top right of Chrome.
                </li>
                <li>
                  Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.
                </li>
                <li>
                  Confirm to place the PJPIIMC icon on your home screen.
                </li>
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {deferredPrompt ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98"
              >
                <Download className="h-4 w-4" />
                <span>Install Mobile Web App Now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Got It — Continue to Staff Portal</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDismissForever}
              className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold transition text-center"
            >
              Don't Show Again on This Device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
