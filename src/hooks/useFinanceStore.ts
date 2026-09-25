import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AppData, 
  BankAccount, 
  CustomerParty, 
  KhataTransaction, 
  ExpenseItem, 
  Language, 
  UdhariItem 
} from '../types';

const STORAGE_KEY = 'MERA_KHATA_OFFLINE_DATA_v2';
const BACKUP_KEY = 'MERA_KHATA_BACKUP_SNAPSHOT';

const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'State Bank of India (SBI)',
    accountNumber: '4821',
    balance: 42500,
    color: '#1e40af',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    name: 'HDFC Bank (Salary)',
    accountNumber: '8910',
    balance: 78250,
    color: '#0369a1',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    name: 'ICICI Bank',
    accountNumber: '1142',
    balance: 15400,
    color: '#b91c1c',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-4',
    name: 'Punjab National Bank (PNB)',
    accountNumber: '9923',
    balance: 12000,
    color: '#ca8a04',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-5',
    name: 'Bank of Baroda (BoB)',
    accountNumber: '3721',
    balance: 8500,
    color: '#ea580c',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-6',
    name: 'Axis Bank',
    accountNumber: '6014',
    balance: 24300,
    color: '#9f1239',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-7',
    name: 'Kotak Mahindra Bank',
    accountNumber: '5519',
    balance: 18700,
    color: '#dc2626',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-8',
    name: 'Canara Bank',
    accountNumber: '4012',
    balance: 9600,
    color: '#0891b2',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-9',
    name: 'Union Bank of India',
    accountNumber: '2981',
    balance: 14200,
    color: '#0d9488',
    type: 'savings',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-10',
    name: 'Paytm Payments Bank / Wallet',
    accountNumber: '9876',
    balance: 3450,
    color: '#0284c7',
    type: 'wallet',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-11',
    name: 'नकद (Cash in Hand)',
    accountNumber: 'CASH',
    balance: 7500,
    color: '#15803d',
    type: 'cash',
    updatedAt: new Date().toISOString(),
  },
];

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

const INITIAL_CUSTOMERS: CustomerParty[] = [
  {
    id: 'cust-1',
    name: 'रमेश भाई (Ramesh Bhai)',
    phone: '9876543210',
    address: 'दुकान नंबर 4, मुख्य बाजार',
    partyType: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-2',
    name: 'शर्मा जी किराना (Sharma Store)',
    phone: '9812345678',
    address: 'वार्ड 2, स्टेशन रोड',
    partyType: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-3',
    name: 'विकास इलेक्ट्रीशियन (Vikash)',
    phone: '9123456780',
    address: 'गली नंबर 3',
    partyType: 'supplier',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cust-4',
    name: 'अमित कुमार (Amit Friend)',
    phone: '9988776655',
    address: 'सेक्टर 5',
    partyType: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_TRANSACTIONS: KhataTransaction[] = [
  // Ramesh Bhai: Given 5000, Received 1500 -> Net 3500 lena hai
  {
    id: 'tx-1',
    customerId: 'cust-1',
    amount: 5000,
    type: 'given',
    date: getTodayString(5),
    note: 'दुकान के काम के लिए सामान उधार दिया',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    customerId: 'cust-1',
    amount: 1500,
    type: 'received',
    date: getTodayString(2),
    note: 'कैश जमा किया (GPay/Cash)',
    createdAt: new Date().toISOString(),
  },
  // Sharma Store: Given 2400 -> Net 2400 lena hai
  {
    id: 'tx-3',
    customerId: 'cust-2',
    amount: 2400,
    type: 'given',
    date: getTodayString(4),
    note: 'पुराना बिल बकाया',
    createdAt: new Date().toISOString(),
  },
  // Vikash Electrician: We got services 1200 on credit (supplier lena nahi dena hai: received 1200 service, or we owe him)
  // To represent "Mujhe Dena Hai", type: 'received' 1200 means party gave us money/service, so balance < 0
  {
    id: 'tx-4',
    customerId: 'cust-3',
    amount: 1200,
    type: 'received',
    date: getTodayString(3),
    note: 'घर की वायरिंग का बिल (हमें चुकाना है)',
    createdAt: new Date().toISOString(),
  },
  // Amit: We owe him 850
  {
    id: 'tx-5',
    customerId: 'cust-4',
    amount: 850,
    type: 'received',
    date: getTodayString(1),
    note: 'होटल बिल का हिस्सा हमें देना है',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: 'दूध, दही और ब्रेड (Dairy & Bread)',
    amount: 140,
    category: 'ration',
    date: getTodayString(0),
    accountName: 'नकद (Cash in Hand)',
    note: 'अमूल गोल्ड 2 लीटर व ब्रेड',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    title: 'बाइक में पेट्रोल (Bike Petrol)',
    amount: 350,
    category: 'travel',
    date: getTodayString(0),
    accountName: 'Paytm Payments Bank / Wallet',
    note: 'HP पेट्रोल पंप',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    title: 'सब्ज़ी मंडी से ताज़ी सब्ज़ियां',
    amount: 280,
    category: 'food',
    date: getTodayString(1),
    accountName: 'नकद (Cash in Hand)',
    note: 'आलू, प्याज, टमाटर व हरी मिर्च',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    title: 'Jio 1 Month Mobile Recharge',
    amount: 299,
    category: 'bills',
    date: getTodayString(2),
    accountName: 'HDFC Bank (Salary)',
    note: 'महीने का रिचार्ज',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-5',
    title: 'किराना सामान (D-Mart Grocery)',
    amount: 1850,
    category: 'ration',
    date: getTodayString(4),
    accountName: 'State Bank of India (SBI)',
    note: 'तेल, आटा, मसाले, साबुन',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-6',
    title: 'मेडिकल स्टोर से दवाइयां',
    amount: 460,
    category: 'health',
    date: getTodayString(6),
    accountName: 'State Bank of India (SBI)',
    note: 'बुखार व सिरदर्द की दवा',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_DATA: AppData = {
  accounts: INITIAL_ACCOUNTS,
  customers: INITIAL_CUSTOMERS,
  transactions: INITIAL_TRANSACTIONS,
  expenses: INITIAL_EXPENSES,
  language: 'hi',
  version: 2,
  lastSavedAt: new Date().toISOString(),
};

export function useFinanceStore() {
  const [data, setData] = useState<AppData>(() => {
    try {
      // 1. Try primary storage key v2
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.accounts && Array.isArray(parsed.accounts)) {
          // Verify customer & transaction array
          if (parsed.customers && Array.isArray(parsed.customers)) {
            return parsed;
          }
        }
      }

      // 2. Check legacy v1 key and migrate safely
      const legacyStored = localStorage.getItem('MERA_KHATA_OFFLINE_DATA_v1');
      if (legacyStored) {
        const legacy = JSON.parse(legacyStored);
        if (legacy.udhari && Array.isArray(legacy.udhari)) {
          // Migrate legacy udhari items into customers & transactions!
          const migratedCustomers: CustomerParty[] = [];
          const migratedTx: KhataTransaction[] = [];

          legacy.udhari.forEach((item: UdhariItem, idx: number) => {
            const custId = `cust-${idx + 1}`;
            migratedCustomers.push({
              id: custId,
              name: item.personName,
              phone: item.phone,
              partyType: 'customer',
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            migratedTx.push({
              id: `tx-${idx + 1}`,
              customerId: custId,
              amount: item.amount,
              type: item.type === 'lena' ? 'given' : 'received',
              date: item.date,
              note: item.note,
              createdAt: item.createdAt || new Date().toISOString(),
            });
          });

          return {
            accounts: legacy.accounts || INITIAL_ACCOUNTS,
            customers: migratedCustomers.length > 0 ? migratedCustomers : INITIAL_CUSTOMERS,
            transactions: migratedTx.length > 0 ? migratedTx : INITIAL_TRANSACTIONS,
            expenses: legacy.expenses || INITIAL_EXPENSES,
            language: legacy.language || 'hi',
            version: 2,
            lastSavedAt: new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.error('Failed to load local finance data', e);
    }
    return INITIAL_DATA;
  });

  // IMMEDIATE AUTO-SAVE with Dual Redundancy on every change
  useEffect(() => {
    try {
      const payload = {
        ...data,
        lastSavedAt: new Date().toISOString(),
      };
      const serialized = JSON.stringify(payload);
      localStorage.setItem(STORAGE_KEY, serialized);
      localStorage.setItem(BACKUP_KEY, serialized); // backup copy
    } catch (e) {
      console.error('Failed to auto-save to localStorage', e);
    }
  }, [data]);

  // Flush on page unload or app swipe away
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data]);

  // Customer balance helper
  const getCustomerBalance = useCallback((customerId: string) => {
    const custTxs = data.transactions.filter((tx) => tx.customerId === customerId);
    let totalGiven = 0; // उधारी दी (You Gave)
    let totalReceived = 0; // जमा मिला (You Received)

    custTxs.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'given') {
        totalGiven += amt;
      } else {
        totalReceived += amt;
      }
    });

    const net = totalGiven - totalReceived;
    return {
      totalGiven,
      totalReceived,
      netBalance: net, // > 0 = lena hai (customer owes you), < 0 = dena hai (you owe customer)
      txCount: custTxs.length,
    };
  }, [data.transactions]);

  // Total Bank Balance
  const totalBankBalance = useMemo(() => {
    return data.accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  }, [data.accounts]);

  // Overall Udhari calculations from all Customers
  const udhariSummary = useMemo(() => {
    let toReceive = 0; // कुल लेना है
    let toPay = 0;     // कुल देना है
    let activeCustomerCount = 0;
    let settledCustomerCount = 0;

    data.customers.forEach((cust) => {
      const bal = getCustomerBalance(cust.id);
      if (bal.netBalance > 0) {
        toReceive += bal.netBalance;
        activeCustomerCount++;
      } else if (bal.netBalance < 0) {
        toPay += Math.abs(bal.netBalance);
        activeCustomerCount++;
      } else if (bal.txCount > 0) {
        settledCustomerCount++;
      }
    });

    return {
      toReceive,
      toPay,
      netBalance: toReceive - toPay,
      pendingCount: activeCustomerCount,
      settledCount: settledCustomerCount,
      totalCustomers: data.customers.length,
    };
  }, [data.customers, getCustomerBalance]);

  // Expenses calculations
  const expenseSummary = useMemo(() => {
    const today = getTodayString(0);
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let total = 0;
    let todayTotal = 0;
    let monthTotal = 0;

    data.expenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      total += amt;
      if (item.date === today) {
        todayTotal += amt;
      }
      if (item.date && item.date.startsWith(currentYearMonth)) {
        monthTotal += amt;
      }
    });

    return {
      total,
      todayTotal,
      monthTotal,
    };
  }, [data.expenses]);

  // Language
  const toggleLanguage = () => {
    setData((prev) => ({
      ...prev,
      language: prev.language === 'hi' ? 'en' : 'hi',
    }));
  };

  const setLanguage = (lang: Language) => {
    setData((prev) => ({ ...prev, language: lang }));
  };

  // Accounts CRUD
  const addAccount = (newAcc: Omit<BankAccount, 'id' | 'updatedAt'>) => {
    const acc: BankAccount = {
      ...newAcc,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      accounts: [acc, ...prev.accounts],
    }));
  };

  const updateAccountBalance = (id: string, newBalance: number) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === id
          ? { ...acc, balance: Number(newBalance), updatedAt: new Date().toISOString() }
          : acc
      ),
    }));
  };

  const adjustAccountBalance = (id: string, delta: number) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              balance: Number(acc.balance) + Number(delta),
              updatedAt: new Date().toISOString(),
            }
          : acc
      ),
    }));
  };

  const editAccount = (id: string, updates: Partial<BankAccount>) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === id ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc
      ),
    }));
  };

  const deleteAccount = (id: string) => {
    setData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((acc) => acc.id !== id),
    }));
  };

  // Customer CRUD
  const addCustomer = (customer: Omit<CustomerParty, 'id' | 'createdAt' | 'updatedAt'>, initialGiven = 0, initialReceived = 0) => {
    const custId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newCust: CustomerParty = {
      ...customer,
      id: custId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTransactions: KhataTransaction[] = [];
    if (initialGiven > 0) {
      newTransactions.push({
        id: `tx-${Date.now()}-1`,
        customerId: custId,
        amount: initialGiven,
        type: 'given',
        date: getTodayString(0),
        note: 'शुरुआती उधारी (Opening Udhar)',
        createdAt: new Date().toISOString(),
      });
    } else if (initialReceived > 0) {
      newTransactions.push({
        id: `tx-${Date.now()}-2`,
        customerId: custId,
        amount: initialReceived,
        type: 'received',
        date: getTodayString(0),
        note: 'शुरुआती जमा (Advance / Opening Deposit)',
        createdAt: new Date().toISOString(),
      });
    }

    setData((prev) => ({
      ...prev,
      customers: [newCust, ...prev.customers],
      transactions: [...newTransactions, ...prev.transactions],
    }));

    return custId;
  };

  const editCustomer = (id: string, updates: Partial<CustomerParty>) => {
    setData((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }));
  };

  const deleteCustomer = (id: string) => {
    setData((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== id),
      transactions: prev.transactions.filter((tx) => tx.customerId !== id),
    }));
  };

  // Khata Transaction CRUD (उधारी देना / जमा लेना)
  const addKhataTransaction = (tx: Omit<KhataTransaction, 'id' | 'createdAt'>) => {
    const newTx: KhataTransaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      customers: prev.customers.map((c) =>
        c.id === tx.customerId ? { ...c, updatedAt: new Date().toISOString() } : c
      ),
    }));
  };

  const editKhataTransaction = (id: string, updates: Partial<KhataTransaction>) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)),
    }));
  };

  const deleteKhataTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
  };

  // Settle Customer Account (Add balancing transaction to make net 0)
  const settleCustomerAccount = (customerId: string, note = 'हिसाब चुकता किया गया (Full Settlement)') => {
    const bal = getCustomerBalance(customerId);
    if (bal.netBalance === 0) return;

    if (bal.netBalance > 0) {
      // Customer owed us money -> Customer pays us in full -> type: 'received'
      addKhataTransaction({
        customerId,
        amount: bal.netBalance,
        type: 'received',
        date: getTodayString(0),
        note,
      });
    } else {
      // We owed customer money -> We pay customer in full -> type: 'given'
      addKhataTransaction({
        customerId,
        amount: Math.abs(bal.netBalance),
        type: 'given',
        date: getTodayString(0),
        note,
      });
    }
  };

  // Expenses CRUD
  const addExpense = (
    item: Omit<ExpenseItem, 'id' | 'createdAt'>,
    deductFromAccountId?: string
  ) => {
    const newExp: ExpenseItem = {
      ...item,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => {
      let updatedAccounts = prev.accounts;
      if (deductFromAccountId) {
        updatedAccounts = prev.accounts.map((acc) => {
          if (acc.id === deductFromAccountId) {
            return {
              ...acc,
              balance: Math.max(0, acc.balance - Number(item.amount)),
              updatedAt: new Date().toISOString(),
            };
          }
          return acc;
        });
      }

      return {
        ...prev,
        accounts: updatedAccounts,
        expenses: [newExp, ...prev.expenses],
      };
    });
  };

  const editExpense = (id: string, updates: Partial<ExpenseItem>) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    }));
  };

  const deleteExpense = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
  };

  // Export JSON
  const exportBackupJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `MeraKhata_Customer_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const importBackupJSON = (jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && Array.isArray(parsed.accounts)) {
        setData({
          ...parsed,
          customers: parsed.customers || INITIAL_CUSTOMERS,
          transactions: parsed.transactions || INITIAL_TRANSACTIONS,
          expenses: parsed.expenses || INITIAL_EXPENSES,
          version: 2,
          lastSavedAt: new Date().toISOString(),
        });
        return true;
      }
    } catch (e) {
      console.error('Invalid backup file', e);
    }
    return false;
  };

  // Reset to default
  const resetToDefault = () => {
    setData(INITIAL_DATA);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      localStorage.setItem(BACKUP_KEY, JSON.stringify(INITIAL_DATA));
    } catch (e) {
      console.error('Reset save error', e);
    }
  };

  return {
    data,
    language: data.language,
    toggleLanguage,
    setLanguage,
    totalBankBalance,
    udhariSummary,
    expenseSummary,
    // Bank Accounts
    addAccount,
    updateAccountBalance,
    adjustAccountBalance,
    editAccount,
    deleteAccount,
    // Customers & Khata
    customers: data.customers,
    transactions: data.transactions,
    getCustomerBalance,
    addCustomer,
    editCustomer,
    deleteCustomer,
    addKhataTransaction,
    editKhataTransaction,
    deleteKhataTransaction,
    settleCustomerAccount,
    // Expenses
    addExpense,
    editExpense,
    deleteExpense,
    // Backup & Restore
    exportBackupJSON,
    importBackupJSON,
    resetToDefault,
  };
}
