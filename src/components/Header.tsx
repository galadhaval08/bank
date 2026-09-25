import React from 'react';
import { WifiOff, Download, Globe, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onOpenSettings,
}) => {
  const { isInstallable, install, isIOS } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-teal-800 text-white shadow-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600/90 text-white font-bold text-xl shadow-inner border border-teal-400/30">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                {t.appName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-900/80 px-2 py-0.5 text-[10px] font-medium text-teal-200 border border-teal-700/50">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                {language === 'hi' ? 'ऑफ़लाइन' : 'Offline'}
              </span>
            </div>
            <p className="text-[11px] text-teal-200/90 mt-0.5 leading-none">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Language Toggle, Install PWA Button, Offline status */}
        <div className="flex items-center gap-2">
          {/* In-app PWA install button */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 px-2.5 py-1 text-xs font-semibold shadow-sm transition active:scale-95 animate-pulse"
              title="Install app to your home screen"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{language === 'hi' ? 'ऐप इंस्टॉल' : 'Install'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 rounded-lg bg-teal-700/80 hover:bg-teal-700 px-2.5 py-1.5 text-xs font-medium text-white transition active:scale-95 border border-teal-600/50"
            title="भाषा बदलें / Change Language"
          >
            <Globe className="h-3.5 w-3.5 text-teal-300" />
            <span className="font-semibold">{language === 'hi' ? 'ENG' : 'हिंदी'}</span>
          </button>
        </div>
      </div>
      
      {/* Offline notification banner if user is offline */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1 text-center text-xs font-medium flex items-center justify-center gap-1.5">
          <WifiOff className="h-3.5 w-3.5" />
          <span>{language === 'hi' ? 'ऑफ़लाइन मोड सक्रिय — डेटा फ़ोन में सुरक्षित रहेगा' : 'Offline Mode active — data saved locally on device'}</span>
        </div>
      )}
    </header>
  );
};
