package com.merakhata.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [BankAccountEntity::class, CustomerEntity::class, KhataTransactionEntity::class, ExpenseEntity::class],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun bankAccountDao(): BankAccountDao
    abstract fun customerDao(): CustomerDao
    abstract fun khataTransactionDao(): KhataTransactionDao
    abstract fun expenseDao(): ExpenseDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "mera_khata_customer_offline.db"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(DatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateInitialData(database)
                    }
                }
            }

            suspend fun populateInitialData(database: AppDatabase) {
                val accountDao = database.bankAccountDao()
                val customerDao = database.customerDao()
                val khataDao = database.khataTransactionDao()
                val expenseDao = database.expenseDao()

                // Initial 11 bank accounts
                val initialAccounts = listOf(
                    BankAccountEntity(name = "State Bank of India (SBI)", accountNumber = "4821", balance = 42500.0, colorHex = "#1e40af"),
                    BankAccountEntity(name = "HDFC Bank (Salary)", accountNumber = "8910", balance = 78250.0, colorHex = "#0369a1"),
                    BankAccountEntity(name = "ICICI Bank", accountNumber = "1142", balance = 15400.0, colorHex = "#b91c1c"),
                    BankAccountEntity(name = "Punjab National Bank (PNB)", accountNumber = "9923", balance = 12000.0, colorHex = "#ca8a04"),
                    BankAccountEntity(name = "Bank of Baroda (BoB)", accountNumber = "3721", balance = 8500.0, colorHex = "#ea580c"),
                    BankAccountEntity(name = "Axis Bank", accountNumber = "6014", balance = 24300.0, colorHex = "#9f1239"),
                    BankAccountEntity(name = "Kotak Mahindra Bank", accountNumber = "5519", balance = 18700.0, colorHex = "#dc2626"),
                    BankAccountEntity(name = "Canara Bank", accountNumber = "4012", balance = 9600.0, colorHex = "#0891b2"),
                    BankAccountEntity(name = "Union Bank of India", accountNumber = "2981", balance = 14200.0, colorHex = "#0d9488"),
                    BankAccountEntity(name = "Paytm Payments Bank / Wallet", accountNumber = "9876", balance = 3450.0, colorHex = "#0284c7", accountType = "wallet"),
                    BankAccountEntity(name = "नकद (Cash in Hand)", accountNumber = "CASH", balance = 7500.0, colorHex = "#15803d", accountType = "cash")
                )
                accountDao.insertAll(initialAccounts)

                // Initial Customers with separate khata
                val rameshId = customerDao.insertCustomer(CustomerEntity(name = "रमेश भाई (Ramesh)", phoneNumber = "9876543210", address = "दुकान नं. 4"))
                val sharmaId = customerDao.insertCustomer(CustomerEntity(name = "शर्मा जी किराना", phoneNumber = "9812345678", address = "स्टेशन रोड"))
                val vikashId = customerDao.insertCustomer(CustomerEntity(name = "विकास इलेक्ट्रीशियन", phoneNumber = "9123456780", address = "गली 3"))

                // Customer transactions (उधारी दी / जमा मिला)
                khataDao.insertAll(
                    listOf(
                        KhataTransactionEntity(customerId = rameshId, amount = 5000.0, type = "given", date = "2026-09-20", note = "सामान उधार दिया"),
                        KhataTransactionEntity(customerId = rameshId, amount = 1500.0, type = "received", date = "2026-09-23", note = "नकद जमा मिला"),
                        KhataTransactionEntity(customerId = sharmaId, amount = 2400.0, type = "given", date = "2026-09-21", note = "पुराना बकाया"),
                        KhataTransactionEntity(customerId = vikashId, amount = 1200.0, type = "received", date = "2026-09-24", note = "वायरिंग का बिल (देना है)")
                    )
                )

                // Initial Expenses
                val initialExpenses = listOf(
                    ExpenseEntity(title = "दूध व ब्रेड", amount = 140.0, category = "ration", date = "2026-09-25", accountName = "नकद", note = "2L अमूल गोल्ड"),
                    ExpenseEntity(title = "बाइक में पेट्रोल", amount = 350.0, category = "travel", date = "2026-09-25", accountName = "Paytm Wallet", note = "HP पंप"),
                    ExpenseEntity(title = "सब्ज़ी मंडी", amount = 280.0, category = "food", date = "2026-09-24", accountName = "नकद"),
                    ExpenseEntity(title = "Jio Mobile Recharge", amount = 299.0, category = "bills", date = "2026-09-23", accountName = "HDFC Bank")
                )
                expenseDao.insertAll(initialExpenses)
            }
        }
    }
}
