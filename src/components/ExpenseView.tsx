import React, { useState } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  Edit3, 
  X, 
  ShoppingBag, 
  Utensils, 
  Fuel, 
  Receipt, 
  HeartPulse, 
  User, 
  Briefcase, 
  Tag,
  Landmark
} from 'lucide-react';
import { ExpenseItem, ExpenseCategory, BankAccount, Language } from '../types';
import { translations } from '../translations';
import { formatINR, formatDateLabel } from '../utils/format';

interface ExpenseViewProps {
  expenses: ExpenseItem[];
  accounts: BankAccount[];
  expenseSummary: {
    total: number;
    todayTotal: number;
    monthTotal: number;
  };
  language: Language;
  onAddExpense: (item: Omit<ExpenseItem, 'id' | 'createdAt'>, deductFromAccountId?: string) => void;
  onEditExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  onDeleteExpense: (id: string) => void;
  isAddModalOpenInitially?: boolean;
}

const CATEGORIES: { id: ExpenseCategory; labelHi: string; labelEn: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }[] = [
  { id: 'ration', labelHi: 'किराना व राशन', labelEn: 'Groceries', icon: ShoppingBag, color: '#16a34a' },
  { id: 'food', labelHi: 'खाना व नाश्ता', labelEn: 'Food & Dining', icon: Utensils, color: '#ea580c' },
  { id: 'travel', labelHi: 'पेट्रोल व यात्रा', labelEn: 'Fuel & Travel', icon: Fuel, color: '#0284c7' },
  { id: 'bills', labelHi: 'बिल व रिचार्ज', labelEn: 'Bills & Recharge', icon: Receipt, color: '#ca8a04' },
  { id: 'health', labelHi: 'दवा व स्वास्थ्य', labelEn: 'Medical', icon: HeartPulse, color: '#dc2626' },
  { id: 'shopping', labelHi: 'कपड़े व खरीदारी', labelEn: 'Shopping', icon: Tag, color: '#9333ea' },
  { id: 'personal', labelHi: 'निजी खर्च', labelEn: 'Personal', icon: User, color: '#475569' },
  { id: 'business', labelHi: 'व्यापार / दुकान', labelEn: 'Business', icon: Briefcase, color: '#0f766e' },
  { id: 'other', labelHi: 'अन्य खर्च', labelEn: 'Other', icon: Tag, color: '#64748b' },
];

export const ExpenseView: React.FC<ExpenseViewProps> = ({
  expenses,
  accounts,
  expenseSummary,
  language,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  isAddModalOpenInitially = false,
}) => {
  const t = translations[language];

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(isAddModalOpenInitially);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('ration');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [note, setNote] = useState('');

  // Filtering calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // 7 days ago
  const weekAgoDate = new Date();
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const weekAgoStr = weekAgoDate.toISOString().split('T')[0];

  const filteredExpenses = expenses.filter((item) => {
    // Date filter
    if (dateFilter === 'today' && item.date !== todayStr) return false;
    if (dateFilter === 'week' && item.date < weekAgoStr) return false;
    if (dateFilter === 'month' && !item.date.startsWith(currentMonthStr)) return false;

    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.note && item.note.toLowerCase().includes(q)) ||
      (item.accountName && item.accountName.toLowerCase().includes(q))
    );
  });

  // Calculate filtered total
  const filteredTotal = filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Group filtered expenses by date
  const groupedExpenses = React.useMemo(() => {
    const groups: { [date: string]: ExpenseItem[] } = {};
    filteredExpenses.forEach((item) => {
      const d = item.date || todayStr;
      if (!groups[d]) groups[d] = [];
      groups[d].push(item);
    });

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => (b > a ? 1 : -1));
    return sortedDates.map((d) => ({
      date: d,
      items: groups[d],
      dayTotal: groups[d].reduce((sum, it) => sum + (Number(it.amount) || 0), 0),
    }));
  }, [filteredExpenses, todayStr]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setTitle('');
    setAmount('');
    setCategory('ration');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedAccountId('');
    setNote('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: ExpenseItem) => {
    setEditingExpense(item);
    setTitle(item.title);
    setAmount(String(item.amount));
    setCategory(item.category);
    setDate(item.date);
    setSelectedAccountId(item.accountId || '');
    setNote(item.note || '');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const matchedAccount = accounts.find((a) => a.id === selectedAccountId);

    if (editingExpense) {
      onEditExpense(editingExpense.id, {
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        accountId: selectedAccountId || undefined,
        accountName: matchedAccount ? matchedAccount.name : undefined,
        note: note.trim() || undefined,
      });
    } else {
      onAddExpense(
        {
          title: title.trim(),
          amount: parsedAmount,
          category,
          date,
          accountId: selectedAccountId || undefined,
          accountName: matchedAccount ? matchedAccount.name : undefined,
          note: note.trim() || undefined,
        },
        selectedAccountId || undefined
      );
    }

    setIsAddModalOpen(false);
  };

  const getCategoryMeta = (catId: ExpenseCategory) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Auto-calculated Total Expense Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t.expenseTitle}</h2>
            <p className="text-[11px] text-slate-500">{t.expenseDesc}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
            {filteredExpenses.length} {language === 'hi' ? 'खर्च' : 'Items'}
          </span>
        </div>

        {/* Big Auto-calculated Total Amount */}
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase">
              {dateFilter === 'today'
                ? t.todayExpense
                : dateFilter === 'week'
                ? (language === 'hi' ? 'इस हफ्ते का कुल खर्च' : 'This Week Total')
                : dateFilter === 'month'
                ? t.thisMonthExpense
                : (language === 'hi' ? 'सभी खर्चों का कुल' : 'All Time Total')}
            </span>
            <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {formatINR(filteredTotal)}
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>
              {t.todayExpense}: <span className="font-bold text-slate-800">{formatINR(expenseSummary.todayTotal)}</span>
            </div>
            <div>
              {language === 'hi' ? 'कुल जोड़:' : 'Total:'} <span className="font-bold text-slate-800">{formatINR(expenseSummary.total)}</span>
            </div>
          </div>
        </div>

        {/* Date Filter Tabs */}
        <div className="mt-3.5 grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setDateFilter('today')}
            className={`py-1.5 rounded-lg transition ${
              dateFilter === 'today'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterToday}
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`py-1.5 rounded-lg transition ${
              dateFilter === 'week'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterWeek}
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`py-1.5 rounded-lg transition ${
              dateFilter === 'month'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterMonth}
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`py-1.5 rounded-lg transition ${
              dateFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.filterAll}
          </button>
        </div>
      </div>

      {/* Action Bar: Search & Add Expense */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchExpense}
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
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-3 py-2 text-xs font-semibold shadow-sm transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t.filterAll}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <cat.icon className="h-3.5 w-3.5" />
            <span>{language === 'hi' ? cat.labelHi : cat.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Expenses grouped by day */}
      <div className="space-y-4">
        {groupedExpenses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <TrendingDown className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              {t.noExpensesFound}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.addExpense}
            </button>
          </div>
        ) : (
          groupedExpenses.map((group) => (
            <div key={group.date} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Day Header with Day Total */}
              <div className="flex items-center justify-between bg-slate-50/90 px-3.5 py-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDateLabel(group.date, language)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({group.date})</span>
                </div>
                <div className="text-xs font-extrabold text-slate-900">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">{t.dayTotal}:</span>
                  {formatINR(group.dayTotal)}
                </div>
              </div>

              {/* Items for this date */}
              <div className="divide-y divide-slate-100 p-1">
                {group.items.map((item) => {
                  const meta = getCategoryMeta(item.category);
                  const Icon = meta.icon;

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-50/50 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
                          style={{ backgroundColor: meta.color }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span>{language === 'hi' ? meta.labelHi : meta.labelEn}</span>
                            {item.accountName && (
                              <>
                                <span>•</span>
                                <span className="text-teal-700 font-medium">{item.accountName}</span>
                              </>
                            )}
                            {item.note && (
                              <>
                                <span>•</span>
                                <span className="italic">{item.note}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs font-black text-slate-900">
                            {formatINR(item.amount)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`${t.confirmDeleteExpense} (${item.title})`)) {
                                onDeleteExpense(item.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title={t.delete}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl safe-area-pb">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingExpense ? (language === 'hi' ? 'खर्च बदलें' : 'Edit Expense') : t.addExpense}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              {/* Title / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.expenseName} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. सब्ज़ी, दूध, बाइक पेट्रोल, खाना"
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  autoFocus
                />
              </div>

              {/* Amount & Quick Numpad Shortcuts */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.amount} *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-lg font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-3 text-lg font-bold text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                {/* Quick Add Chips */}
                <div className="flex items-center gap-1.5 mt-2">
                  {[50, 100, 200, 500, 1000].map((amtVal) => (
                    <button
                      key={amtVal}
                      type="button"
                      onClick={() => {
                        const cur = parseFloat(amount) || 0;
                        setAmount(String(cur + amtVal));
                      }}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      +{amtVal}
                    </button>
                  ))}
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="text-[11px] font-medium text-rose-600 ml-auto"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.category}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSel = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-left transition ${
                          isSel
                            ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cat.color }} />
                        <span className="truncate text-[11px]">
                          {language === 'hi' ? cat.labelHi : cat.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.date}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Bank Account Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.paidFromAccount}
                </label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                  >
                    <option value="">{t.notLinked}</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatINR(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedAccountId && !editingExpense && (
                  <p className="mt-1 text-[11px] text-teal-700">
                    {language === 'hi' ? '✓ इस खाते से बैलेंस अपने आप कम हो जाएगा।' : '✓ Balance will be automatically deducted from this account.'}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.note}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="अतिरिक्त विवरण..."
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
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
