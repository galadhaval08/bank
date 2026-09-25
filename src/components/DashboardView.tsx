import React from 'react';
import { 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingDown, 
  PlusCircle, 
  Plus, 
  Wallet, 
  ChevronRight,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { BankAccount, CustomerParty, KhataTransaction, ExpenseItem, Language } from '../types';
import { translations } from '../translations';
import { formatINR, formatDateLabel } from '../utils/format';
import { TabType } from './BottomNav';

interface DashboardViewProps {
  accounts: BankAccount[];
  customers: CustomerParty[];
  transactions: KhataTransaction[];
  expenses: ExpenseItem[];
  language: Language;
  totalBankBalance: number;
  udhariSummary: {
    toReceive: number;
    toPay: number;
    netBalance: number;
    pendingCount: number;
    settledCount: number;
    totalCustomers?: number;
  };
  expenseSummary: {
    total: number;
    todayTotal: number;
    monthTotal: number;
  };
  onNavigateTab: (tab: TabType) => void;
  onOpenAddAccount: () => void;
  onOpenAddUdhar: () => void;
  onOpenAddExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  customers,
  transactions,
  expenses,
  language,
  totalBankBalance,
  udhariSummary,
  expenseSummary,
  onNavigateTab,
  onOpenAddAccount,
  onOpenAddUdhar,
  onOpenAddExpense,
}) => {
  const t = translations[language];

  // Cash vs Bank calculation
  const cashAccounts = accounts.filter(a => a.type === 'cash');
  const cashBalance = cashAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const digitalBankBalance = totalBankBalance - cashBalance;

  // Recent 6 activities combined (Khata transactions + Expenses)
  const recentActivities = React.useMemo(() => {
    const list: {
      id: string;
      title: string;
      subtitle: string;
      amount: number;
      type: 'expense' | 'udhari-lena' | 'udhari-dena';
      date: string;
      isPositive: boolean;
    }[] = [];

    // Add recent khata transactions with customer name
    transactions.slice(0, 6).forEach((tx) => {
      const cust = customers.find(c => c.id === tx.customerId);
      const isGiven = tx.type === 'given';
      list.push({
        id: tx.id,
        title: cust ? cust.name : (language === 'hi' ? 'ग्राहक' : 'Customer'),
        subtitle: isGiven
          ? (language === 'hi' ? 'उधारी दी (You Gave)' : 'You Gave')
          : (language === 'hi' ? 'जमा मिला (You Got)' : 'You Got'),
        amount: tx.amount,
        type: isGiven ? 'udhari-lena' : 'udhari-dena',
        date: tx.date,
        isPositive: isGiven,
      });
    });

    // Add recent expenses
    expenses.slice(0, 6).forEach((e) => {
      list.push({
        id: e.id,
        title: e.title,
        subtitle: language === 'hi' ? 'रोज़ाना खर्च' : 'Daily Expense',
        amount: e.amount,
        type: 'expense',
        date: e.date,
        isPositive: false,
      });
    });

    // Sort by date descending
    return list.sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 6);
  }, [transactions, customers, expenses, language]);

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* 3 Main Summary Cards Requested by User */}
      <div className="space-y-3">
        {/* CARD 1: कुल बैंक बैलेंस */}
        <div 
          onClick={() => onNavigateTab('accounts')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 p-4 text-white shadow-lg shadow-teal-950/15 cursor-pointer active:scale-[0.99] transition"
        >
          <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-3 top-3 h-16 w-16 rounded-full bg-teal-500/10 pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600/80 backdrop-blur border border-teal-400/20">
                <Landmark className="h-4 w-4 text-teal-100" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
                {t.totalBankBalance}
              </span>
            </div>
            <span className="flex items-center text-xs font-medium text-teal-200 group">
              {accounts.length} {t.accountsCount}
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </span>
          </div>

          <div className="mt-2.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {formatINR(totalBankBalance)}
            </h2>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-teal-600/40 pt-2.5 text-xs text-teal-100">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              <span>बैंक: {formatINR(digitalBankBalance)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-300" />
              <span>नकद: {formatINR(cashBalance)}</span>
            </div>
            <div className="text-[11px] underline text-teal-200 font-medium">
              {t.editBalance} →
            </div>
          </div>
        </div>

        {/* CARD 2: कुल उधारी (नेट, लेना है, देना है) */}
        <div 
          onClick={() => onNavigateTab('udhari')}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer active:scale-[0.99] transition hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.totalUdhari}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-600 flex items-center">
              {language === 'hi' ? 'खाता खोलें' : 'Open Khata'}
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">{t.netBalance}: </span>
              <span className={`text-2xl font-black ${
                udhariSummary.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {formatINR(udhariSummary.netBalance)}
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {udhariSummary.pendingCount} {language === 'hi' ? 'लेन-देन बाकी' : 'Pending'}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {/* मुझे लेना है (To Receive) */}
            <div className="rounded-xl bg-emerald-50/80 p-2.5 border border-emerald-100/80">
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t.toReceive}</span>
              </div>
              <div className="mt-1 text-base font-bold text-emerald-700">
                +{formatINR(udhariSummary.toReceive)}
              </div>
            </div>

            {/* मुझे देना है (To Give) */}
            <div className="rounded-xl bg-rose-50/80 p-2.5 border border-rose-100/80">
              <div className="flex items-center gap-1 text-[11px] font-medium text-rose-800">
                <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />
                <span>{t.toPay}</span>
              </div>
              <div className="mt-1 text-base font-bold text-rose-700">
                -{formatINR(udhariSummary.toPay)}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: कुल खर्चा (आज, इस महीने, कुल) */}
        <div 
          onClick={() => onNavigateTab('expenses')}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm cursor-pointer active:scale-[0.99] transition hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <TrendingDown className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.totalExpenses}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-amber-700 flex items-center">
              {language === 'hi' ? 'खर्च देखें' : 'View Expenses'}
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">{t.thisMonthExpense}: </span>
              <span className="text-2xl font-black text-slate-800">
                {formatINR(expenseSummary.monthTotal)}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {t.todayExpense}: <span className="font-bold text-slate-700">{formatINR(expenseSummary.todayTotal)}</span>
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span>{language === 'hi' ? 'सभी खर्चों का कुल जोड़ (All Time):' : 'All Time Expenses:'}</span>
            <span className="font-bold text-slate-900">{formatINR(expenseSummary.total)}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.quickActions}
          </span>
          <span className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {language === 'hi' ? 'तुरंत एंट्री' : 'Quick'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Add Account */}
          <button
            onClick={onOpenAddAccount}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition border border-teal-200/60 active:scale-95"
          >
            <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
              <Landmark className="h-4 w-4" />
            </div>
            <span className="text-center text-[11px] leading-tight">
              {t.addAccountShort}
            </span>
          </button>

          {/* Add Udhar */}
          <button
            onClick={onOpenAddUdhar}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold text-xs transition border border-indigo-200/60 active:scale-95"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-center text-[11px] leading-tight">
              {t.addUdharShort}
            </span>
          </button>

          {/* Add Expense */}
          <button
            onClick={onOpenAddExpense}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition border border-amber-200/60 active:scale-95"
          >
            <div className="h-8 w-8 rounded-full bg-amber-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
              <TrendingDown className="h-4 w-4" />
            </div>
            <span className="text-center text-[11px] leading-tight">
              {t.addExpenseShort}
            </span>
          </button>
        </div>
      </div>

      {/* Bank Accounts Snapshot (Quick preview of first 4-5 accounts with balance) */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-teal-700" />
            <span className="text-sm font-bold text-slate-800">
              {t.accountDistribution}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('accounts')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center"
          >
            {t.viewAll} ({accounts.length})
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </button>
        </div>

        <div className="space-y-2">
          {accounts.slice(0, 4).map((acc) => (
            <div
              key={acc.id}
              onClick={() => onNavigateTab('accounts')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition border border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: acc.color || '#0f766e' }}
                >
                  {acc.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {acc.name}
                  </div>
                  {acc.accountNumber && (
                    <div className="text-[10px] text-slate-500">
                      ••{acc.accountNumber}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">
                  {formatINR(acc.balance)}
                </div>
                <div className="text-[10px] text-teal-600 font-medium">
                  {language === 'hi' ? 'बैलेंस बदलें' : 'Edit'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {accounts.length > 4 && (
          <button
            onClick={() => onNavigateTab('accounts')}
            className="mt-2.5 w-full py-1.5 text-center text-xs font-semibold text-teal-700 bg-teal-50/70 hover:bg-teal-100 rounded-lg transition"
          >
            +{accounts.length - 4} {language === 'hi' ? 'और खाते देखें' : 'more accounts'}
          </button>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-800">
              {t.recentActivity}
            </span>
          </div>
        </div>

        {recentActivities.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            {t.noRecentActivity}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${
                      act.type === 'udhari-lena'
                        ? 'bg-emerald-100 text-emerald-700'
                        : act.type === 'udhari-dena'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {act.type === 'udhari-lena' ? (
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                    ) : act.type === 'udhari-dena' ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {act.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {act.subtitle} • {formatDateLabel(act.date, language)}
                    </div>
                  </div>
                </div>

                <div
                  className={`text-xs font-bold ${
                    act.isPositive ? 'text-emerald-600' : 'text-slate-800'
                  }`}
                >
                  {act.isPositive ? '+' : '-'}{formatINR(act.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
