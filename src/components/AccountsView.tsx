import React, { useState } from 'react';
import { 
  Landmark, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  X,
  CreditCard,
  Building
} from 'lucide-react';
import { BankAccount, BankAccountType, Language } from '../types';
import { translations } from '../translations';
import { formatINR, formatDateLabel } from '../utils/format';

interface AccountsViewProps {
  accounts: BankAccount[];
  totalBankBalance: number;
  language: Language;
  onAddAccount: (acc: Omit<BankAccount, 'id' | 'updatedAt'>) => void;
  onUpdateBalance: (id: string, balance: number) => void;
  onAdjustBalance: (id: string, delta: number) => void;
  onDeleteAccount: (id: string) => void;
  onEditAccount: (id: string, updates: Partial<BankAccount>) => void;
  isAddModalOpenInitially?: boolean;
}

const PRESET_BANKS = [
  { name: 'State Bank of India (SBI)', color: '#1e40af', type: 'savings' as BankAccountType },
  { name: 'HDFC Bank', color: '#0369a1', type: 'savings' as BankAccountType },
  { name: 'ICICI Bank', color: '#b91c1c', type: 'savings' as BankAccountType },
  { name: 'Axis Bank', color: '#9f1239', type: 'savings' as BankAccountType },
  { name: 'Punjab National Bank (PNB)', color: '#ca8a04', type: 'savings' as BankAccountType },
  { name: 'Bank of Baroda (BoB)', color: '#ea580c', type: 'savings' as BankAccountType },
  { name: 'Kotak Mahindra Bank', color: '#dc2626', type: 'savings' as BankAccountType },
  { name: 'Canara Bank', color: '#0891b2', type: 'savings' as BankAccountType },
  { name: 'Union Bank of India', color: '#0d9488', type: 'savings' as BankAccountType },
  { name: 'Paytm Payments Bank', color: '#0284c7', type: 'wallet' as BankAccountType },
  { name: 'नकद (Cash in Hand)', color: '#15803d', type: 'cash' as BankAccountType },
];

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  totalBankBalance,
  language,
  onAddAccount,
  onUpdateBalance,
  onAdjustBalance,
  onDeleteAccount,
  onEditAccount,
  isAddModalOpenInitially = false,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(isAddModalOpenInitially);
  
  // State for Edit Balance Modal
  const [editingBalanceAccount, setEditingBalanceAccount] = useState<BankAccount | null>(null);
  const [editMode, setEditMode] = useState<'direct' | 'adjust'>('direct');
  const [directBalanceInput, setDirectBalanceInput] = useState('');
  const [adjustAmountInput, setAdjustAmountInput] = useState('');
  const [adjustType, setAdjustType] = useState<'deposit' | 'withdraw'>('deposit');

  // State for Add Account Form
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccType, setNewAccType] = useState<BankAccountType>('savings');
  const [newAccColor, setNewAccColor] = useState('#0f766e');

  // Filtered accounts
  const filteredAccounts = accounts.filter((acc) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      acc.name.toLowerCase().includes(q) ||
      (acc.accountNumber && acc.accountNumber.toLowerCase().includes(q))
    );
  });

  const handleOpenEditBalance = (acc: BankAccount) => {
    setEditingBalanceAccount(acc);
    setDirectBalanceInput(String(acc.balance));
    setAdjustAmountInput('');
    setEditMode('direct');
  };

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBalanceAccount) return;

    if (editMode === 'direct') {
      const val = parseFloat(directBalanceInput);
      if (!isNaN(val)) {
        onUpdateBalance(editingBalanceAccount.id, val);
      }
    } else {
      const amt = parseFloat(adjustAmountInput);
      if (!isNaN(amt) && amt > 0) {
        const delta = adjustType === 'deposit' ? amt : -amt;
        onAdjustBalance(editingBalanceAccount.id, delta);
      }
    }
    setEditingBalanceAccount(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    onAddAccount({
      name: newAccName.trim(),
      accountNumber: newAccNumber.trim(),
      balance: parseFloat(newAccBalance) || 0,
      type: newAccType,
      color: newAccColor,
    });

    // Reset
    setNewAccName('');
    setNewAccNumber('');
    setNewAccBalance('');
    setNewAccType('savings');
    setNewAccColor('#0f766e');
    setIsAddModalOpen(false);
  };

  const handleSelectPreset = (preset: typeof PRESET_BANKS[0]) => {
    setNewAccName(preset.name);
    setNewAccColor(preset.color);
    setNewAccType(preset.type);
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Total Balance Card */}
      <div className="rounded-2xl bg-teal-800 p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-teal-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
              {t.totalBankBalance}
            </span>
          </div>
          <span className="text-xs bg-teal-900/80 px-2 py-0.5 rounded-full text-teal-200 font-medium">
            {accounts.length} {language === 'hi' ? 'खाते' : 'Accounts'}
          </span>
        </div>
        <div className="mt-2 text-3xl font-extrabold tracking-tight">
          {formatINR(totalBankBalance)}
        </div>
        <p className="mt-1 text-xs text-teal-200/90">
          {t.accountsDesc}
        </p>
      </div>

      {/* Action Bar: Search & Add Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'बैंक या खाता खोजें...' : 'Search bank or account...'}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-3 py-2 text-xs font-semibold shadow-sm transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addNewAccount}</span>
        </button>
      </div>

      {/* Account List */}
      <div className="space-y-2.5">
        {filteredAccounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <Building className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              {language === 'hi' ? 'कोई खाता नहीं मिला।' : 'No accounts found.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.addNewAccount}
            </button>
          </div>
        ) : (
          filteredAccounts.map((acc, index) => (
            <div
              key={acc.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                {/* Bank badge & title */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-extrabold text-sm shadow-sm"
                    style={{ backgroundColor: acc.color || '#0f766e' }}
                  >
                    {acc.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 leading-tight">
                        {acc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      {acc.accountNumber && (
                        <span>A/c: ••{acc.accountNumber}</span>
                      )}
                      <span className="inline-block h-1 w-1 rounded-full bg-slate-300" />
                      <span className="capitalize">
                        {acc.type === 'savings'
                          ? t.savings.split(' ')[0]
                          : acc.type === 'current'
                          ? t.current.split(' ')[0]
                          : acc.type === 'wallet'
                          ? t.wallet
                          : t.cash}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => {
                    if (confirm(`${t.confirmDeleteAccount} (${acc.name})`)) {
                      onDeleteAccount(acc.id);
                    }
                  }}
                  className="text-slate-300 hover:text-rose-600 p-1 rounded-lg transition"
                  title={t.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Balance & Edit Button Row */}
              <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {language === 'hi' ? 'वर्तमान बैलेंस' : 'Current Balance'}
                  </span>
                  <div className="text-xl font-black text-slate-900">
                    {formatINR(acc.balance)}
                  </div>
                </div>

                {/* Edit Balance Button - Prominently accessible as requested */}
                <button
                  onClick={() => handleOpenEditBalance(acc)}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <Edit3 className="h-3.5 w-3.5 text-teal-700" />
                  <span>{t.editBalance}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: Edit Balance Modal */}
      {editingBalanceAccount && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl safe-area-pb">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.updateBalanceTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {editingBalanceAccount.name}
                </p>
              </div>
              <button
                onClick={() => setEditingBalanceAccount(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode Selector Tabs: Direct Balance vs Adjust +/- */}
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setEditMode('direct')}
                className={`py-1.5 rounded-lg transition ${
                  editMode === 'direct'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.newBalance}
              </button>
              <button
                type="button"
                onClick={() => setEditMode('adjust')}
                className={`py-1.5 rounded-lg transition ${
                  editMode === 'adjust'
                    ? 'bg-white text-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.adjustBalance} (+ / -)
              </button>
            </div>

            <form onSubmit={handleSaveBalance} className="mt-4 space-y-4">
              {editMode === 'direct' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'सीधा नया बैलेंस लिखें (₹)' : 'Enter New Balance (₹)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-base font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={directBalanceInput}
                      onChange={(e) => setDirectBalanceInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-3 text-lg font-bold text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {language === 'hi' ? 'पिछला बैलेंस:' : 'Current:'}{' '}
                    <span className="font-semibold text-slate-800">
                      {formatINR(editingBalanceAccount.balance)}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('deposit')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition ${
                        adjustType === 'deposit'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                          : 'border-slate-200 text-slate-600 bg-slate-50'
                      }`}
                    >
                      <ArrowDownLeft className="h-4 w-4" />
                      {t.deposit}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('withdraw')}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition ${
                        adjustType === 'withdraw'
                          ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                          : 'border-slate-200 text-slate-600 bg-slate-50'
                      }`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      {t.withdraw}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'hi' ? 'रकम डालें (₹)' : 'Adjustment Amount (₹)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-base font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        required
                        value={adjustAmountInput}
                        onChange={(e) => setAdjustAmountInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-3 text-lg font-bold text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>
                  </div>

                  {adjustAmountInput && !isNaN(parseFloat(adjustAmountInput)) && (
                    <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 flex justify-between items-center">
                      <span>{language === 'hi' ? 'नया बैलेंस बनेगा:' : 'Resulting Balance:'}</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {formatINR(
                          editingBalanceAccount.balance +
                            (adjustType === 'deposit'
                              ? parseFloat(adjustAmountInput)
                              : -parseFloat(adjustAmountInput))
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBalanceAccount(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 font-bold text-xs text-white shadow-md active:scale-95"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl safe-area-pb">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {t.addNewAccount}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Presets for Popular Indian Banks */}
            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                {language === 'hi' ? 'जल्दी चुनें (लोकप्रिय बैंक व कैश):' : 'Quick select (Popular banks):'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BANKS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-[11px] font-medium px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                  >
                    {preset.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.accountName} *
                </label>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="उदा. State Bank of India, HDFC"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.accountNumber}
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={newAccNumber}
                    onChange={(e) => setNewAccNumber(e.target.value)}
                    placeholder="उदा. 4821"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.initialBalance}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.accountType}
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewAccType('savings')}
                    className={`py-1.5 px-2 rounded-lg border font-medium text-left ${
                      newAccType === 'savings'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.savings}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccType('current')}
                    className={`py-1.5 px-2 rounded-lg border font-medium text-left ${
                      newAccType === 'current'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.current}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccType('wallet')}
                    className={`py-1.5 px-2 rounded-lg border font-medium text-left ${
                      newAccType === 'wallet'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.wallet}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccType('cash')}
                    className={`py-1.5 px-2 rounded-lg border font-medium text-left ${
                      newAccType === 'cash'
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.cash}
                  </button>
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'रंग चुनें' : 'Color tag'}
                </label>
                <div className="flex items-center gap-2">
                  {['#1e40af', '#0369a1', '#b91c1c', '#ca8a04', '#ea580c', '#9f1239', '#0d9488', '#15803d', '#475569'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewAccColor(c)}
                      className="h-6 w-6 rounded-full border-2 transition"
                      style={{
                        backgroundColor: c,
                        borderColor: newAccColor === c ? '#000000' : 'transparent',
                        transform: newAccColor === c ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 font-bold text-xs text-white shadow-md active:scale-95"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
