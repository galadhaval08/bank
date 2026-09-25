import React, { useRef, useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Smartphone, 
  Globe, 
  Check, 
  AlertCircle,
  HardDrive,
  Code2,
  FolderArchive
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { downloadAndroidProjectZip } from '../utils/exportAndroidZip';

interface SettingsViewProps {
  language: Language;
  onToggleLanguage: () => void;
  onSetLanguage: (lang: Language) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonText: string) => boolean;
  onResetToDefault: () => void;
  accountsCount: number;
  udhariCount: number;
  expenseCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onToggleLanguage,
  onSetLanguage,
  onExportBackup,
  onImportBackup,
  onResetToDefault,
  accountsCount,
  udhariCount,
  expenseCount,
}) => {
  const t = translations[language];
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        if (confirm(t.restoreConfirm)) {
          const success = onImportBackup(text);
          if (success) {
            setStatusMessage({ text: t.restoreSuccess });
          } else {
            setStatusMessage({ text: language === 'hi' ? 'फ़ाइल अमान्य है!' : 'Invalid backup file!', isError: true });
          }
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleExport = () => {
    onExportBackup();
    setStatusMessage({ text: t.backupSuccess });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* 100% Offline Status Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-950 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-tight">
              {language === 'hi' ? '100% ऑफ़लाइन डेटा सुरक्षित है' : '100% Offline & Private'}
            </h2>
            <p className="text-xs text-emerald-800/90 mt-0.5">
              {t.offlineDataInfo}
            </p>
          </div>
        </div>

        {/* Data counts summary */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-emerald-200/80 pt-2.5 text-center text-xs">
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100">
            <span className="font-bold text-emerald-900 block">{accountsCount}</span>
            <span className="text-[10px] text-emerald-700">{language === 'hi' ? 'बैंक खाते' : 'Accounts'}</span>
          </div>
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100">
            <span className="font-bold text-emerald-900 block">{udhariCount}</span>
            <span className="text-[10px] text-emerald-700">{language === 'hi' ? 'उधारी एंट्री' : 'Udhar Entries'}</span>
          </div>
          <div className="bg-white/80 rounded-lg p-1.5 border border-emerald-100">
            <span className="font-bold text-emerald-900 block">{expenseCount}</span>
            <span className="text-[10px] text-emerald-700">{language === 'hi' ? 'खर्च एंट्री' : 'Expenses'}</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs font-semibold shadow-sm transition ${
            statusMessage.isError
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.isError ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>
            <AlertCircle className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      )}

      {/* Backup & Restore Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HardDrive className="h-4 w-4 text-teal-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {language === 'hi' ? 'बैकअप व सुरक्षित डेटा' : 'Backup & Data Management'}
          </h3>
        </div>

        <p className="text-xs text-slate-600">
          {language === 'hi'
            ? 'आप अपना पूरा डेटा कभी भी फ़ोन में डाउनलोड कर सकते हैं या नए फ़ोन में रीस्टोर कर सकते हैं।'
            : 'You can download a complete backup file to your phone anytime or restore it on any device.'}
        </p>

        <div className="space-y-2 pt-1">
          {/* Export JSON Button */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white py-2.5 px-4 text-xs font-bold shadow-sm transition active:scale-98"
          >
            <Download className="h-4 w-4" />
            <span>{t.exportBackup}</span>
          </button>

          {/* Import JSON Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 px-4 text-xs font-semibold transition active:scale-98"
          >
            <Upload className="h-4 w-4" />
            <span>{t.importBackup}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Android Installation Guide (Add to Home Screen) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-teal-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.howToInstall}
            </h3>
          </div>
          {isInstalled && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              ✓ {language === 'hi' ? 'इनस्टॉल्ड' : 'Installed'}
            </span>
          )}
        </div>

        {isInstallable && (
          <button
            onClick={install}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-3 px-4 text-xs font-bold shadow-md transition active:scale-98 animate-pulse"
          >
            <Download className="h-4 w-4" />
            <span>{language === 'hi' ? '📲 एक क्लिक में फ़ोन में इनस्टॉल करें (Install App)' : '📲 Install App on Phone'}</span>
          </button>
        )}

        {/* Direct APK Link explanation & Generator */}
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-950 space-y-2 border border-amber-200">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <Download className="h-4 w-4 text-amber-700" />
            <span>{language === 'hi' ? 'सीधे .APK फ़ाइल चाहिए? (Direct APK Link):' : 'Need direct .APK file?'}</span>
          </div>

          <p className="text-[11px] text-amber-800 leading-relaxed">
            {language === 'hi'
              ? 'Chrome में जब आप "Install app" चुनते हैं, तो Android खुद बैकग्राउंड में एक WebAPK (.apk) बनाकर फ़ोन में इंस्टॉल कर देता है। अगर आपको किसी को भेजने के लिए अलग से .apk फ़ाइल डाउनलोड करनी है:'
              : 'When you tap "Install app" in Chrome, Android automatically builds an official WebAPK (.apk) on your device. If you want a standalone .apk file to download and share:'}
          </p>

          <a
            href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 text-xs shadow-xs transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{language === 'hi' ? '📥 यहाँ से सीधे .APK जनरेट करें (PWABuilder APK)' : '📥 Generate .APK directly on PWABuilder'}</span>
          </a>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-2 border border-slate-100">
          <p className="font-semibold text-slate-900">
            {language === 'hi' ? 'Android फ़ोन में कैसे लगाएं (WebAPK तरीका):' : 'Installation Instructions for Android:'}
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-slate-600">
            <li>
              {language === 'hi'
                ? 'Chrome ब्राउज़र में ऊपर दाईं ओर दिए गए 3 डॉट्स (⋮) पर टैप करें।'
                : 'In Chrome browser, tap the 3 dots (⋮) menu in top right.'}
            </li>
            <li>
              {language === 'hi'
                ? 'सूची में से "Add to Home screen" या "Install app" चुनें।'
                : 'Tap "Add to Home screen" or "Install app".'}
            </li>
            <li>
              {language === 'hi'
                ? 'अब यह ऐप आपके फ़ोन में सामान्य मोबाइल ऐप की तरह काम करेगा, और बिना इंटरनेट तुरंत खुलेगा!'
                : 'The app icon will appear on your phone home screen and open instantly offline!'}
            </li>
          </ol>
        </div>
      </div>

      {/* Native Android Project (Kotlin + Jetpack Compose) ZIP Export */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-indigo-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
              {language === 'hi' ? 'Native Android Source Code (Kotlin + Compose)' : 'Native Android Code (Kotlin + Compose)'}
            </h3>
          </div>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
            Room SQLite
          </span>
        </div>

        <p className="text-xs text-indigo-900/90 leading-relaxed">
          {language === 'hi'
            ? 'हमने आपके लिए पूरा Native Android (Kotlin, Jetpack Compose, Room Database) प्रोजेक्ट तैयार कर दिया है। इसे ZIP में डाउनलोड करके Android Studio में खोलें और सीधे APK (.apk) बना लें।'
            : 'Complete Native Android Kotlin + Jetpack Compose + Room SQLite source project is ready. Download as ZIP and build your .apk in Android Studio with 1 click.'}
        </p>

        <button
          onClick={async () => {
            try {
              setStatusMessage({ text: language === 'hi' ? 'Android Project ZIP तैयार हो रही है...' : 'Generating Android ZIP...' });
              await downloadAndroidProjectZip();
              setStatusMessage({ text: language === 'hi' ? 'Android Project ZIP डाउनलोड हो गई!' : 'Android Project ZIP downloaded!' });
            } catch (e) {
              console.error(e);
              setStatusMessage({ text: 'Error generating ZIP', isError: true });
            }
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white py-2.5 px-4 text-xs font-bold shadow-sm transition active:scale-98"
        >
          <FolderArchive className="h-4 w-4" />
          <span>{language === 'hi' ? '📦 Android Studio प्रोजेक्ट ZIP डाउनलोड करें' : '📦 Download Android Studio Project ZIP'}</span>
        </button>

        <div className="rounded-xl bg-white p-3 text-[11px] text-slate-700 space-y-1.5 border border-indigo-100/80">
          <p className="font-bold text-slate-900">
            {language === 'hi' ? 'Android Studio में APK (.apk) कैसे बनाएं:' : 'How to build APK in Android Studio:'}
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-slate-600">
            <li>{language === 'hi' ? 'ZIP फ़ाइल को अपने कंप्यूटर पर Extract करें।' : 'Extract the downloaded ZIP file on your computer.'}</li>
            <li>{language === 'hi' ? 'Android Studio खोलें और File > Open से फ़ोल्डर खोलें।' : 'Open Android Studio and choose File > Open.'}</li>
            <li>{language === 'hi' ? 'ऊपर मेनू में Build > Build Bundle(s) / APK(s) > Build APK(s) पर क्लिक करें।' : 'Click Build > Build Bundle(s) / APK(s) > Build APK(s).'}</li>
            <li>{language === 'hi' ? 'आपको तैयार "app-debug.apk" मिल जाएगी, जिसे किसी भी फ़ोन में इनस्टॉल कर सकते हैं।' : 'You will get "app-debug.apk" ready to install on any Android phone.'}</li>
          </ol>
        </div>
      </div>

      {/* Language Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-teal-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.languageSwitch}
            </span>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => onSetLanguage('hi')}
              className={`px-3 py-1 rounded-lg transition ${
                language === 'hi'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी (Hindi)
            </button>
            <button
              onClick={() => onSetLanguage('en')}
              className={`px-3 py-1 rounded-lg transition ${
                language === 'en'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Reset to Sample Data */}
      <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-900">
              {t.resetData}
            </h4>
            <p className="text-[11px] text-rose-700 mt-0.5">
              {language === 'hi' ? 'शुरुआती 10-12 बैंक खाते और सैंपल डेटा वापस लाएं।' : 'Restores initial 11 sample bank accounts & ledger data.'}
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm(t.resetConfirm)) {
                onResetToDefault();
                setStatusMessage({ text: language === 'hi' ? 'डेटा रीसेट हो गया!' : 'Data reset to sample!' });
              }
            }}
            className="flex items-center gap-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 px-3 py-1.5 text-xs font-bold transition active:scale-95 border border-rose-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.resetData.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 pt-2">
        {language === 'hi' ? 'मेरा खाता • व्यक्तिगत व व्यावसायिक हिसाब-किताब' : 'Mera Khata • Personal & Business Finance'}
      </div>
    </div>
  );
};
