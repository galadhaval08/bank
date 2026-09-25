export type Language = 'hi' | 'en';

export type BankAccountType = 'savings' | 'current' | 'wallet' | 'cash';

export interface BankAccount {
  id: string;
  name: string;
  bankCode?: string;
  accountNumber?: string;
  balance: number;
  color: string;
  type: BankAccountType;
  updatedAt: string;
}

export type KhataTransactionType = 'given' | 'received'; // 'given' = आपने उधार दिया (You Gave), 'received' = जमा मिला (You Got)

export interface KhataTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: KhataTransactionType;
  date: string; // YYYY-MM-DD
  note?: string;
  billNumber?: string;
  createdAt: string;
}

export interface CustomerParty {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  partyType?: 'customer' | 'supplier'; // ग्राहक या सप्लायर
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export type UdhariType = 'lena' | 'dena';
export type UdhariStatus = 'pending' | 'settled';

export interface UdhariItem {
  id: string;
  personName: string;
  phone?: string;
  amount: number;
  type: UdhariType;
  date: string;
  note?: string;
  status: UdhariStatus;
  settledAt?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'food' 
  | 'ration' 
  | 'travel' 
  | 'bills' 
  | 'health' 
  | 'shopping' 
  | 'personal' 
  | 'business'
  | 'other';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  accountId?: string; // Linked bank account (optional)
  accountName?: string;
  note?: string;
  createdAt: string;
}

export interface AppData {
  accounts: BankAccount[];
  customers: CustomerParty[];
  transactions: KhataTransaction[];
  udhari?: UdhariItem[]; // legacy fallback
  expenses: ExpenseItem[];
  language: Language;
  version: number;
  lastSavedAt?: string;
}
