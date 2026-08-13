import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Layers,
  Terminal,
  Store,
  Sparkles,
  X,
  FileCode,
  Globe
} from 'lucide-react';

interface PlayStoreDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreDeployModal: React.FC<PlayStoreDeployModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwabuilder' | 'direct' | 'capacitor' | 'bubblewrap'>('pwabuilder');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = window.location.origin;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Google Play Store & Mobile App Publishing</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Turn this AuraHR System into a native mobile app for Google Play Store & iOS devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>1. PWABuilder (Easiest & Official)</span>
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'direct'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5 text-blue-400" />
            <span>2. Direct Phone Install (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('capacitor')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'capacitor'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 border-x border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-amber-400" />
            <span>3. Capacitor (Android Studio)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  PWA Manifest & Service Worker are Active!
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Your app already includes a valid <code>manifest.json</code>, responsive meta tags, app icons, and an active service worker. You can generate a Google Play Store package (<code>.aab</code> / <code>.apk</code>) in less than 3 minutes using Microsoft & Google's <strong>PWABuilder</strong>.
                </p>
              </div>

              {/* Step by Step */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider">
                  Steps to Generate Google Play Store Package:
                </h5>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">Step 1: Copy your App Live URL</span>
                    <button
                      onClick={() => handleCopy(currentUrl, 'url')}
                      className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-emerald-500/30"
                    >
                      {copiedText === 'url' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedText === 'url' ? 'Copied!' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 truncate">
                    {currentUrl}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Step 2: Open PWABuilder.com</span>
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Open PWABuilder
                    </a>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Paste your copied App URL on PWABuilder and click <strong>"Start"</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-200 block">Step 3: Click "Package for Stores" → Google Play</span>
                  <p className="text-slate-400 text-[11px]">
                    Configure your package name (e.g. <code>com.aurahr.staffportal</code>) and click <strong>"Generate Package"</strong>. It will output a signed <code>.aab</code> (Android App Bundle).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-200 block">Step 4: Upload to Google Play Console</span>
                  <p className="text-slate-400 text-[11px]">
                    Go to your <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">Google Play Console</a> account, create a new app listing, upload the generated <code>.aab</code> bundle, and publish to production or internal testing!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                <h4 className="font-bold text-blue-300 text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-blue-400" />
                  Instant Direct Mobile App Installation (No Store Needed)
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Hospital staff can install AuraHR directly on Android and iPhones immediately as a standalone fullscreen app without waiting for Play Store review.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {/* Android Steps */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-extrabold text-emerald-400 text-xs uppercase flex items-center gap-1.5">
                    <Globe className="h-4 w-4" /> Android (Chrome / Edge)
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li>Open this URL on your phone in Chrome.</li>
                    <li>Tap the <strong>three dots (⋮)</strong> menu in the top right.</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>AuraHR will appear on your phone's app drawer with its hospital icon!</li>
                  </ol>
                </div>

                {/* iOS Steps */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-extrabold text-blue-400 text-xs uppercase flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4" /> iPhone / iPad (Safari)
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li>Open this URL on your iPhone in Safari.</li>
                    <li>Tap the <strong>Share</strong> button (box with arrow ↑) at the bottom.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>"Add"</strong> in the top right corner.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-amber-400" />
                  Native Android Project with Capacitor (For Android Studio)
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  If you want full native Android code (Java/Kotlin), Bluetooth hardware scanner integrations, or offline background services, export the project and run Capacitor:
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Terminal Commands:</span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `npm i @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init AuraHR com.aurahr.staffportal --web-dir=dist\nnpx cap add android\nnpm run build\nnpx cap copy\nnpx cap open android`,
                        'cap'
                      )
                    }
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-sans font-bold"
                  >
                    {copiedText === 'cap' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedText === 'cap' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl text-emerald-300 space-y-1 select-all overflow-x-auto">
                  <p># 1. Install Capacitor</p>
                  <p>npm i @capacitor/core @capacitor/cli @capacitor/android</p>
                  <p className="pt-1"># 2. Initialize Mobile Project</p>
                  <p>npx cap init AuraHR com.aurahr.staffportal --web-dir=dist</p>
                  <p className="pt-1"># 3. Add Android Platform</p>
                  <p>npx cap add android</p>
                  <p className="pt-1"># 4. Build and Sync</p>
                  <p>npm run build && npx cap copy</p>
                  <p className="pt-1"># 5. Open in Android Studio</p>
                  <p>npx cap open android</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Target Platform: Android 8.0+ & iOS 14+</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
