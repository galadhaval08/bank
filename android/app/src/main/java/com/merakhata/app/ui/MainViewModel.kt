package com.merakhata.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.merakhata.app.data.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class UdhariSummary(
    val toReceive: Double = 0.0,
    val toPay: Double = 0.0,
    val netBalance: Double = 0.0,
    val pendingCount: Int = 0
)

data class ExpenseSummary(
    val total: Double = 0.0,
    val todayTotal: Double = 0.0,
    val monthTotal: Double = 0.0
)

class MainViewModel(
    private val accountDao: BankAccountDao,
    private val customerDao: CustomerDao,
    private val khataDao: KhataTransactionDao,
    private val expenseDao: ExpenseDao
) : ViewModel() {

    val accounts = accountDao.getAllAccounts().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val customers = customerDao.getAllCustomers().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val transactions = khataDao.getAllTransactions().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val expenseList = expenseDao.getAllExpenses().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val totalBankBalance = accounts.map { list ->
        list.sumOf { it.balance }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val udhariSummary = combine(customers, transactions) { custList, txList ->
        var receive = 0.0
        var pay = 0.0
        var activeCount = 0

        custList.forEach { cust ->
            val custTxs = txList.filter { it.customerId == cust.id }
            val given = custTxs.filter { it.type == "given" }.sumOf { it.amount }
            val recd = custTxs.filter { it.type == "received" }.sumOf { it.amount }
            val net = given - recd

            if (net > 0) {
                receive += net
                activeCount++
            } else if (net < 0) {
                pay += Math.abs(net)
                activeCount++
            }
        }

        UdhariSummary(
            toReceive = receive,
            toPay = pay,
            netBalance = receive - pay,
            pendingCount = activeCount
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UdhariSummary())

    val expenseSummary = expenseList.map { list ->
        val todayStr = java.time.LocalDate.now().toString()
        val monthPrefix = todayStr.substring(0, 7)

        var total = 0.0
        var today = 0.0
        var month = 0.0

        list.forEach { exp ->
            total += exp.amount
            if (exp.date == todayStr) today += exp.amount
            if (exp.date.startsWith(monthPrefix)) month += exp.amount
        }

        ExpenseSummary(total = total, todayTotal = today, monthTotal = month)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), ExpenseSummary())

    // Account Actions
    fun addAccount(name: String, accountNumber: String, balance: Double, color: String) {
        viewModelScope.launch {
            accountDao.insertAccount(
                BankAccountEntity(name = name, accountNumber = accountNumber, balance = balance, colorHex = color)
            )
        }
    }

    fun updateAccountBalance(id: Long, newBalance: Double) {
        viewModelScope.launch {
            accountDao.updateBalance(id, newBalance)
        }
    }

    fun deleteAccount(account: BankAccountEntity) {
        viewModelScope.launch {
            accountDao.deleteAccount(account)
        }
    }

    // Customer & Khata Actions
    fun addCustomer(name: String, phone: String, address: String) {
        viewModelScope.launch {
            customerDao.insertCustomer(
                CustomerEntity(name = name, phoneNumber = phone, address = address, createdAt = java.time.LocalDate.now().toString())
            )
        }
    }

    fun deleteCustomer(customer: CustomerEntity) {
        viewModelScope.launch {
            khataDao.deleteTransactionsForCustomer(customer.id)
            customerDao.deleteCustomer(customer)
        }
    }

    fun addTransaction(customerId: Long, amount: Double, type: String, date: String, note: String) {
        viewModelScope.launch {
            khataDao.insertTransaction(
                KhataTransactionEntity(
                    customerId = customerId,
                    amount = amount,
                    type = type,
                    date = date,
                    note = note,
                    createdAt = java.time.LocalDate.now().toString()
                )
            )
        }
    }

    fun deleteTransaction(tx: KhataTransactionEntity) {
        viewModelScope.launch {
            khataDao.deleteTransaction(tx)
        }
    }

    // Expense Actions
    fun addExpense(title: String, amount: Double, category: String, date: String, accountName: String, note: String) {
        viewModelScope.launch {
            expenseDao.insertExpense(
                ExpenseEntity(title = title, amount = amount, category = category, date = date, accountName = accountName, note = note)
            )
        }
    }

    fun deleteExpense(item: ExpenseEntity) {
        viewModelScope.launch {
            expenseDao.deleteExpense(item)
        }
    }
}

class MainViewModelFactory(
    private val accountDao: BankAccountDao,
    private val customerDao: CustomerDao,
    private val khataDao: KhataTransactionDao,
    private val expenseDao: ExpenseDao
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(accountDao, customerDao, khataDao, expenseDao) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
