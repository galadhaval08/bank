import React from 'react';
import { Home, Landmark, BookOpen, Receipt, Settings } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

export type TabType = 'home' | 'accounts' | 'udhari' | 'expenses' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
  pendingUdharCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  language,
  pendingUdharCount,
}) => {
  const t = translations[language];

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'accounts', label: t.navAccounts, icon: Landmark },
    { id: 'udhari', label: t.navUdhari, icon: BookOpen },
    { id: 'expenses', label: t.navExpenses, icon: Receipt },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] safe-area-pb">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[62px] ${
                isActive
                  ? 'text-teal-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-110 text-teal-700' : 'text-slate-500'
                  }`}
                />
                {tab.id === 'udhari' && pendingUdharCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm">
                    {pendingUdharCount}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 text-[11px] leading-tight truncate max-w-[68px] ${
                  isActive ? 'font-bold text-teal-700' : 'text-slate-600 font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-1 w-6 rounded-full bg-teal-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
