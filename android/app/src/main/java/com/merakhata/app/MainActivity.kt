package com.merakhata.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.merakhata.app.ui.MainViewModel
import com.merakhata.app.ui.MainViewModelFactory
import com.merakhata.app.ui.screens.*

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels {
        val app = application as MeraKhataApplication
        val db = app.database
        MainViewModelFactory(db.bankAccountDao(), db.udhariDao(), db.expenseDao())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFF0F766E),
                    secondary = Color(0xFF0D9488),
                    background = Color(0xFFF1F5F9)
                )
            ) {
                MainAppScreen(viewModel)
            }
        }
    }
}

enum class Screen(val title: String) {
    HOME("होम"),
    ACCOUNTS("बैंक खाते"),
    UDHARI("उधारी"),
    EXPENSES("खर्च")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(viewModel: MainViewModel) {
    var currentScreen by remember { mutableStateOf(Screen.HOME) }

    val accounts by viewModel.accounts.collectAsState()
    val customers by viewModel.customers.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val expenseList by viewModel.expenseList.collectAsState()

    val totalBalance by viewModel.totalBankBalance.collectAsState()
    val udhariSummary by viewModel.udhariSummary.collectAsState()
    val expenseSummary by viewModel.expenseSummary.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("मेरा खाता (Mera Khata)") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F766E),
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                NavigationBarItem(
                    selected = currentScreen == Screen.HOME,
                    onClick = { currentScreen = Screen.HOME },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text(Screen.HOME.title) }
                )
                NavigationBarItem(
                    selected = currentScreen == Screen.ACCOUNTS,
                    onClick = { currentScreen = Screen.ACCOUNTS },
                    icon = { Icon(Icons.Default.AccountBalance, contentDescription = "Accounts") },
                    label = { Text(Screen.ACCOUNTS.title) }
                )
                NavigationBarItem(
                    selected = currentScreen == Screen.UDHARI,
                    onClick = { currentScreen = Screen.UDHARI },
                    icon = { Icon(Icons.Default.MenuBook, contentDescription = "Udhari") },
                    label = { Text(Screen.UDHARI.title) }
                )
                NavigationBarItem(
                    selected = currentScreen == Screen.EXPENSES,
                    onClick = { currentScreen = Screen.EXPENSES },
                    icon = { Icon(Icons.Default.Receipt, contentDescription = "Expenses") },
                    label = { Text(Screen.EXPENSES.title) }
                )
            }
        }
    ) { innerPadding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            color = Color(0xFFF1F5F9)
        ) {
            when (currentScreen) {
                Screen.HOME -> DashboardScreen(
                    totalBalance = totalBalance,
                    udhariSummary = udhariSummary,
                    expenseSummary = expenseSummary,
                    accounts = accounts,
                    onNavigateAccounts = { currentScreen = Screen.ACCOUNTS },
                    onNavigateUdhari = { currentScreen = Screen.UDHARI },
                    onNavigateExpenses = { currentScreen = Screen.EXPENSES }
                )
                Screen.ACCOUNTS -> AccountsScreen(
                    accounts = accounts,
                    totalBalance = totalBalance,
                    onAddAccount = { name, num, bal, col -> viewModel.addAccount(name, num, bal, col) },
                    onUpdateBalance = { id, bal -> viewModel.updateAccountBalance(id, bal) },
                    onDeleteAccount = { viewModel.deleteAccount(it) }
                )
                Screen.UDHARI -> UdhariScreen(
                    customers = customers,
                    transactions = transactions,
                    summary = udhariSummary,
                    onAddCustomer = { name, phone, address -> viewModel.addCustomer(name, phone, address) },
                    onDeleteCustomer = { viewModel.deleteCustomer(it) },
                    onAddTransaction = { custId, amt, type, date, note -> viewModel.addTransaction(custId, amt, type, date, note) },
                    onDeleteTransaction = { viewModel.deleteTransaction(it) }
                )
                Screen.EXPENSES -> ExpenseScreen(
                    expenses = expenseList,
                    summary = expenseSummary,
                    onAddExpense = { t, a, c, d, acc, nt -> viewModel.addExpense(t, a, c, d, acc, nt) },
                    onDeleteExpense = { viewModel.deleteExpense(it) }
                )
            }
        }
    }
}
