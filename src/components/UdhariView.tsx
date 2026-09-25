import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Share2, 
  X,
  Phone,
  User,
  Calendar,
  FileText,
  ArrowLeft,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus
} from 'lucide-react';
import { CustomerParty, KhataTransaction, KhataTransactionType, Language } from '../types';
import { translations } from '../translations';
import { formatINR, formatDateLabel } from '../utils/format';

interface UdhariViewProps {
  customers: CustomerParty[];
  transactions: KhataTransaction[];
  udhariSummary: {
    toReceive: number;
    toPay: number;
    netBalance: number;
    pendingCount: number;
    settledCount: number;
    totalCustomers: number;
  };
  language: Language;
  getCustomerBalance: (customerId: string) => {
    totalGiven: number;
    totalReceived: number;
    netBalance: number;
    txCount: number;
  };
  onAddCustomer: (customer: Omit<CustomerParty, 'id' | 'createdAt' | 'updatedAt'>, initialGiven?: number, initialReceived?: number) => string;
  onEditCustomer: (id: string, updates: Partial<CustomerParty>) => void;
  onDeleteCustomer: (id: string) => void;
  onAddTransaction: (tx: Omit<KhataTransaction, 'id' | 'createdAt'>) => void;
  onEditTransaction: (id: string, updates: Partial<KhataTransaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onSettleCustomer: (customerId: string) => void;
  isAddModalOpenInitially?: boolean;
}

export const UdhariView: React.FC<UdhariViewProps> = ({
  customers,
  transactions,
  udhariSummary,
  language,
  getCustomerBalance,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onSettleCustomer,
  isAddModalOpenInitially = false,
}) => {
  const t = translations[language];

  // Active customer state for detailed passbook view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<'all' | 'lena' | 'dena' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(isAddModalOpenInitially);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txMode, setTxMode] = useState<KhataTransactionType>('given'); // 'given' = उधारी दी, 'received' = जमा मिला

  // Add Customer Form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custOpeningType, setCustOpeningType] = useState<'none' | 'given' | 'received'>('none');
  const [custOpeningAmount, setCustOpeningAmount] = useState('');

  // Add Transaction Form
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txNote, setTxNote] = useState('');

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Selected customer transactions sorted by date descending
  const selectedCustomerTxs = useMemo(() => {
    if (!selectedCustomerId) return [];
    return transactions
      .filter((tx) => tx.customerId === selectedCustomerId)
      .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : (b.createdAt > a.createdAt ? 1 : -1)));
  }, [transactions, selectedCustomerId]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const bal = getCustomerBalance(cust.id);
      
      // Filter tab
      if (activeFilter === 'lena' && bal.netBalance <= 0) return false;
      if (activeFilter === 'dena' && bal.netBalance >= 0) return false;
      if (activeFilter === 'settled' && bal.netBalance !== 0) return false;

      // Search
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        cust.name.toLowerCase().includes(q) ||
        (cust.phone && cust.phone.includes(q)) ||
        (cust.address && cust.address.toLowerCase().includes(q))
      );
    });
  }, [customers, activeFilter, searchQuery, getCustomerBalance]);

  // WhatsApp reminder message for a customer
  const handleSendCustomerReminder = (cust: CustomerParty) => {
    const bal = getCustomerBalance(cust.id);
    const isHi = language === 'hi';
    const amountStr = Math.abs(bal.netBalance);

    let msg = '';
    if (bal.netBalance > 0) {
      msg = isHi
        ? `नमस्ते ${cust.name}, मेरा खाता रिकॉर्ड के अनुसार आपका कुल बकाया हिसाब ₹${amountStr} बाकी है। कृपया जल्द से जल्द भुगतान करने की कृपा करें। धन्यवाद!`
        : `Hello ${cust.name}, as per your ledger record in Mera Khata, pending balance of ₹${amountStr} is due. Please clear at your earliest. Thank you!`;
    } else {
      msg = isHi
        ? `नमस्ते ${cust.name}, आपके खाते का बैलेंस ₹${amountStr} (जमा) है। धन्यवाद!`
        : `Hello ${cust.name}, your account balance is ₹${amountStr} in advance. Thank you!`;
    }

    const encoded = encodeURIComponent(msg);
    const phoneParam = cust.phone ? `&phone=${cust.phone.replace(/[^0-9]/g, '')}` : '';
    window.open(`https://api.whatsapp.com/send?text=${encoded}${phoneParam}`, '_blank');
  };

  // Submit Add Customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    const openingAmt = parseFloat(custOpeningAmount) || 0;
    const initialGiven = custOpeningType === 'given' ? openingAmt : 0;
    const initialReceived = custOpeningType === 'received' ? openingAmt : 0;

    const newId = onAddCustomer(
      {
        name: custName.trim(),
        phone: custPhone.trim() || undefined,
        address: custAddress.trim() || undefined,
        partyType: 'customer',
      },
      initialGiven,
      initialReceived
    );

    // Reset
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustOpeningType('none');
    setCustOpeningAmount('');
    setIsAddCustomerOpen(false);

    // Automatically open this customer's khata passbook
    setSelectedCustomerId(newId);
  };

  // Submit Add Transaction (Jama or Udhar)
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !txAmount) return;

    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) return;

    onAddTransaction({
      customerId: selectedCustomerId,
      amount: amt,
      type: txMode,
      date: txDate,
      note: txNote.trim() || undefined,
    });

    // Reset
    setTxAmount('');
    setTxNote('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setIsAddTxOpen(false);
  };

  // -------------------------------------------------------------
  // VIEW 1: CUSTOMER PASSBOOK / DETAIL KHATA VIEW
  // -------------------------------------------------------------
  if (selectedCustomer) {
    const bal = getCustomerBalance(selectedCustomer.id);
    const isLena = bal.netBalance > 0;
    const isDena = bal.netBalance < 0;
    const isSettled = bal.netBalance === 0;

    return (
      <div className="space-y-4 pb-28 pt-2 animate-in fade-in duration-150">
        {/* Top Header with Back Button */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              title="वापस जाएं"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {selectedCustomer.name}
              </h2>
              {selectedCustomer.phone && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span>{selectedCustomer.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* WhatsApp reminder */}
            <button
              onClick={() => handleSendCustomerReminder(selectedCustomer)}
              className="rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-2 transition border border-emerald-200"
              title={t.sendWhatsAppReminder}
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* Settle account button */}
            {!isSettled && (
              <button
                onClick={() => {
                  if (confirm(`${language === 'hi' ? 'क्या आप इस ग्राहक का पूरा हिसाब चुकता करना चाहते हैं?' : 'Settle full balance for this customer?'}`)) {
                    onSettleCustomer(selectedCustomer.id);
                  }
                }}
                className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-semibold transition"
                title="हिसाब चुकता"
              >
                {t.markAsSettled}
              </button>
            )}

            {/* Delete Customer */}
            <button
              onClick={() => {
                if (confirm(`${t.confirmDeleteUdhar} (${selectedCustomer.name})`)) {
                  onDeleteCustomer(selectedCustomer.id);
                  setSelectedCustomerId(null);
                }
              }}
              className="rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 p-2 transition border border-rose-200"
              title="ग्राहक हटाएं"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Customer Balance Summary Card */}
        <div
          className={`rounded-2xl p-4 text-white shadow-md transition ${
            isSettled
              ? 'bg-slate-700'
              : isLena
              ? 'bg-gradient-to-br from-emerald-600 to-emerald-800'
              : 'bg-gradient-to-br from-rose-600 to-rose-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              {language === 'hi' ? 'खाता स्थिति (Net Balance)' : 'Account Status'}
            </span>
            <span className="text-[11px] bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full font-bold">
              {isSettled
                ? (language === 'hi' ? '✓ हिसाब बराबर' : '✓ Settled')
                : isLena
                ? (language === 'hi' ? '🟢 आपको लेना है' : '🟢 You will get')
                : (language === 'hi' ? '🔴 आपको देना है' : '🔴 You will pay')}
            </span>
          </div>

          <div className="mt-2 text-3xl font-black tracking-tight">
            {formatINR(Math.abs(bal.netBalance))}
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-white/20 pt-2.5 text-xs">
            <div>
              <span className="text-white/80 block">{language === 'hi' ? 'कुल उधारी दी:' : 'Total Given:'}</span>
              <span className="font-bold text-sm">+{formatINR(bal.totalGiven)}</span>
            </div>
            <div className="text-right">
              <span className="text-white/80 block">{language === 'hi' ? 'कुल जमा मिला:' : 'Total Received:'}</span>
              <span className="font-bold text-sm">-{formatINR(bal.totalReceived)}</span>
            </div>
          </div>
        </div>

        {/* Passbook / Ledger Transactions */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <BookOpen className="h-4 w-4 text-teal-700" />
              <span>{language === 'hi' ? 'लेन-देन पासबुक (History)' : 'Transaction History'}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              {selectedCustomerTxs.length} {language === 'hi' ? 'एंट्री' : 'entries'}
            </span>
          </div>

          {selectedCustomerTxs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {language === 'hi'
                ? 'इस खाते में अभी कोई लेन-देन नहीं है। नीचे दिए गए बटन से उधारी या जमा दर्ज करें।'
                : 'No transactions in this ledger yet. Use buttons below to record credit or payment.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {selectedCustomerTxs.map((tx) => {
                const isGiven = tx.type === 'given';
                return (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50/60 transition">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs mt-0.5 ${
                          isGiven ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}
                      >
                        {isGiven ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold ${
                              isGiven ? 'text-rose-800' : 'text-emerald-800'
                            }`}
                          >
                            {isGiven
                              ? (language === 'hi' ? 'उधारी दी (You Gave)' : 'You Gave (Credit)')
                              : (language === 'hi' ? 'जमा मिला (You Got)' : 'You Got (Payment)')}
                          </span>
                        </div>

                        {tx.note && (
                          <p className="text-xs text-slate-700 font-medium mt-0.5">
                            {tx.note}
                          </p>
                        )}

                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDateLabel(tx.date, language)} ({tx.date})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div
                          className={`text-sm font-black ${
                            isGiven ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {isGiven ? '+' : '-'}{formatINR(tx.amount)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(language === 'hi' ? 'क्या आप इस एंट्री को हटाना चाहते हैं?' : 'Delete this entry?')) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1 text-slate-300 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2 Big Bottom Action Buttons like Khatabook / OkCredit */}
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200/80 p-3 shadow-lg">
          <div className="mx-auto max-w-lg grid grid-cols-2 gap-3">
            {/* BUTTON 1: उधारी दी (You Gave) */}
            <button
              onClick={() => {
                setTxMode('given');
                setTxAmount('');
                setTxNote('');
                setIsAddTxOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md active:scale-95 transition"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>{language === 'hi' ? '🔴 उधारी दी (दिया ₹)' : '🔴 Gave (You Gave)'}</span>
            </button>

            {/* BUTTON 2: जमा मिला (You Received) */}
            <button
              onClick={() => {
                setTxMode('received');
                setTxAmount('');
                setTxNote('');
                setIsAddTxOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition"
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>{language === 'hi' ? '🟢 जमा मिला (आया ₹)' : '🟢 Got (Payment Recd)'}</span>
            </button>
          </div>
        </div>

        {/* Add Transaction Modal */}
        {isAddTxOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl safe-area-pb">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {txMode === 'given'
                      ? (language === 'hi' ? 'उधारी दी (You Gave)' : 'Record Credit Given')
                      : (language === 'hi' ? 'जमा मिला (Payment Received)' : 'Record Payment Received')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedCustomer.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddTxOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTransaction} className="mt-4 space-y-4">
                {/* Amount input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'रकम (₹) *' : 'Amount (₹) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-lg font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-8 pr-3 text-lg font-bold text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      autoFocus
                    />
                  </div>

                  {/* Quick Amount Suggestion Chips */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {[100, 200, 500, 1000, 2000, 5000].map((amtVal) => (
                      <button
                        key={amtVal}
                        type="button"
                        onClick={() => {
                          const cur = parseFloat(txAmount) || 0;
                          setTxAmount(String(cur + amtVal));
                        }}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        +{amtVal}
                      </button>
                    ))}
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
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                {/* Note / Bill Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'सामान या विवरण (उदा. 5kg आटा, नकद आदि)' : 'Note / Items details'}
                  </label>
                  <input
                    type="text"
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                    placeholder="उदा. किराना सामान, पुराना हिसाब, GPay..."
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddTxOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-slate-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 ${
                      txMode === 'given' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
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
  }

  // -------------------------------------------------------------
  // VIEW 2: CUSTOMERS LIST VIEW (ALL CUSTOMER KHATA DIARIES)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Auto-calculated Total Udhari Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t.udhariTitle}</h2>
            <p className="text-[11px] text-slate-500">{t.udhariDesc}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {customers.length} {language === 'hi' ? 'ग्राहक खाते' : 'Customers'}
          </span>
        </div>

        {/* 3 Auto-calculated Figures */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {/* कुल लेना है (To receive) */}
          <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              {t.filterLena}
            </span>
            <span className="text-base font-extrabold text-emerald-700 block mt-0.5">
              +{formatINR(udhariSummary.toReceive)}
            </span>
          </div>

          {/* कुल देना है (To give) */}
          <div className="rounded-xl bg-rose-50 p-2 border border-rose-100">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">
              {t.filterDena}
            </span>
            <span className="text-base font-extrabold text-rose-700 block mt-0.5">
              -{formatINR(udhariSummary.toPay)}
            </span>
          </div>

          {/* नेट उधारी (Net) */}
          <div className="rounded-xl bg-slate-100 p-2 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">
              {language === 'hi' ? 'नेट बाकी' : 'Net'}
            </span>
            <span className={`text-base font-black block mt-0.5 ${
              udhariSummary.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {formatINR(udhariSummary.netBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar: Search & Add Customer Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPerson}
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
          onClick={() => setIsAddCustomerOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-3 py-2 text-xs font-semibold shadow-sm transition active:scale-95 whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4" />
          <span>{t.addCustomerBtn}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t.filterAll} ({customers.length})
        </button>
        <button
          onClick={() => setActiveFilter('lena')}
          className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'lena'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          🟢 {t.filterLena}
        </button>
        <button
          onClick={() => setActiveFilter('dena')}
          className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'dena'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          🔴 {t.filterDena}
        </button>
        <button
          onClick={() => setActiveFilter('settled')}
          className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
            activeFilter === 'settled'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ✓ {t.filterSettled}
        </button>
      </div>

      {/* Customer Khata Cards List */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <User className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              {t.noUdhariFound}
            </p>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.addCustomerBtn}
            </button>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const bal = getCustomerBalance(cust.id);
            const isLena = bal.netBalance > 0;
            const isDena = bal.netBalance < 0;
            const isSettled = bal.netBalance === 0;

            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerId(cust.id)}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-teal-500 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-sm text-white ${
                        isSettled
                          ? 'bg-slate-400'
                          : isLena
                          ? 'bg-emerald-600'
                          : 'bg-rose-600'
                      }`}
                    >
                      {cust.name.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 leading-tight">
                          {cust.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {cust.phone ? <span>{cust.phone}</span> : <span>खाता सक्रिय</span>}
                        <span>•</span>
                        <span>{bal.txCount} लेन-देन</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-base font-black ${
                        isSettled
                          ? 'text-slate-400'
                          : isLena
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {isSettled
                        ? '₹0'
                        : `${isLena ? '+' : '-'}${formatINR(Math.abs(bal.netBalance))}`}
                    </div>
                    <span
                      className={`text-[10px] font-bold block ${
                        isSettled
                          ? 'text-slate-400'
                          : isLena
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {isSettled
                        ? t.settled
                        : isLena
                        ? (language === 'hi' ? 'लेना है' : 'To Receive')
                        : (language === 'hi' ? 'देना है' : 'To Pay')}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {language === 'hi' ? 'खाता पासबुक खोलें →' : 'Open Ledger →'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400">
                      {language === 'hi' ? 'उधारी/जमा दर्ज करने के लिए टैप करें' : 'Tap to record'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-2xl safe-area-pb">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {t.addCustomerBtn}
              </h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customerName} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="उदा. रमेश भाई, सुरेश टेलर"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.phoneNumber}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="उदा. 9876543210"
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'पता / दुकान का विवरण (वैकल्पिक)' : 'Address / Note (Optional)'}
                </label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="उदा. मुख्य बाजार, दुकान नंबर 5"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Opening Balance */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'शुरुआती बकाया हिसाब (Opening Balance)' : 'Opening Balance'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCustOpeningType('none')}
                    className={`py-1.5 px-2 rounded-lg border font-medium ${
                      custOpeningType === 'none'
                        ? 'border-slate-800 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    कोई बाकी नहीं (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustOpeningType('given')}
                    className={`py-1.5 px-2 rounded-lg border font-medium ${
                      custOpeningType === 'given'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🟢 लेना है
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustOpeningType('received')}
                    className={`py-1.5 px-2 rounded-lg border font-medium ${
                      custOpeningType === 'received'
                        ? 'border-rose-600 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🔴 देना है
                  </button>
                </div>

                {custOpeningType !== 'none' && (
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-lg font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={custOpeningAmount}
                      onChange={(e) => setCustOpeningAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-xl border border-slate-300 py-2 pl-8 pr-3 text-base font-bold text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
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
