/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinanceStore } from './hooks/useFinanceStore';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { AccountsView } from './components/AccountsView';
import { UdhariView } from './components/UdhariView';
import { ExpenseView } from './components/ExpenseView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const {
    data,
    language,
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
    customers,
    transactions,
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
  } = useFinanceStore();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [openAddAccountModal, setOpenAddAccountModal] = useState(false);
  const [openAddUdharModal, setOpenAddUdharModal] = useState(false);
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);

  // Quick Action Handlers from Dashboard
  const handleQuickAddAccount = () => {
    setCurrentTab('accounts');
    setOpenAddAccountModal(true);
  };

  const handleQuickAddUdhar = () => {
    setCurrentTab('udhari');
    setOpenAddUdharModal(true);
  };

  const handleQuickAddExpense = () => {
    setCurrentTab('expenses');
    setOpenAddExpenseModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Mobile Header */}
      <Header
        language={language}
        onToggleLanguage={toggleLanguage}
        onOpenSettings={() => setCurrentTab('settings')}
      />

      {/* Main View Area constrained to mobile width on larger screens for realistic app feel */}
      <main className="flex-1 w-full max-w-lg mx-auto px-3.5 sm:px-4">
        {currentTab === 'home' && (
          <DashboardView
            accounts={data.accounts}
            customers={customers}
            transactions={transactions}
            expenses={data.expenses}
            language={language}
            totalBankBalance={totalBankBalance}
            udhariSummary={udhariSummary}
            expenseSummary={expenseSummary}
            onNavigateTab={setCurrentTab}
            onOpenAddAccount={handleQuickAddAccount}
            onOpenAddUdhar={handleQuickAddUdhar}
            onOpenAddExpense={handleQuickAddExpense}
          />
        )}

        {currentTab === 'accounts' && (
          <AccountsView
            accounts={data.accounts}
            totalBankBalance={totalBankBalance}
            language={language}
            onAddAccount={addAccount}
            onUpdateBalance={updateAccountBalance}
            onAdjustBalance={adjustAccountBalance}
            onDeleteAccount={deleteAccount}
            onEditAccount={editAccount}
            isAddModalOpenInitially={openAddAccountModal}
          />
        )}

        {currentTab === 'udhari' && (
          <UdhariView
            customers={customers}
            transactions={transactions}
            udhariSummary={udhariSummary}
            language={language}
            getCustomerBalance={getCustomerBalance}
            onAddCustomer={addCustomer}
            onEditCustomer={editCustomer}
            onDeleteCustomer={deleteCustomer}
            onAddTransaction={addKhataTransaction}
            onEditTransaction={editKhataTransaction}
            onDeleteTransaction={deleteKhataTransaction}
            onSettleCustomer={settleCustomerAccount}
            isAddModalOpenInitially={openAddUdharModal}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpenseView
            expenses={data.expenses}
            accounts={data.accounts}
            expenseSummary={expenseSummary}
            language={language}
            onAddExpense={addExpense}
            onEditExpense={editExpense}
            onDeleteExpense={deleteExpense}
            isAddModalOpenInitially={openAddExpenseModal}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            language={language}
            onToggleLanguage={toggleLanguage}
            onSetLanguage={setLanguage}
            onExportBackup={exportBackupJSON}
            onImportBackup={importBackupJSON}
            onResetToDefault={resetToDefault}
            accountsCount={data.accounts.length}
            udhariCount={transactions.length}
            expenseCount={data.expenses.length}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setOpenAddAccountModal(false);
          setOpenAddUdharModal(false);
          setOpenAddExpenseModal(false);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        pendingUdharCount={udhariSummary.pendingCount}
      />
    </div>
  );
}
