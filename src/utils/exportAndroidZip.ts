import JSZip from 'jszip';

export async function downloadAndroidProjectZip() {
  const zip = new JSZip();

  // Root files
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MeraKhata"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
    id("com.google.devtools.ksp") version "2.0.0-1.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.0" apply false
}
`
  );

  // app/build.gradle.kts
  zip.file(
    'app/build.gradle.kts',
    `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.merakhata.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.merakhata.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.4")
    implementation("androidx.activity:activity-compose:1.9.1")
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")

    // Room Database for 100% Offline Local Storage
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")
}
`
  );

  // AndroidManifest.xml
  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:name=".MeraKhataApplication"
        android:allowBackup="true"
        android:label="मेरा खाता (Mera Khata)"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  );

  // Kotlin source files
  const packageDir = 'app/src/main/java/com/merakhata/app';

  // Read the files we just wrote or embed them
  zip.file(
    `${packageDir}/MeraKhataApplication.kt`,
    `package com.merakhata.app

import android.app.Application
import com.merakhata.app.data.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob

class MeraKhataApplication : Application() {
    private val applicationScope = CoroutineScope(SupervisorJob())
    val database by lazy { AppDatabase.getDatabase(this, applicationScope) }
}
`
  );

  zip.file(
    `${packageDir}/data/Entities.kt`,
    `package com.merakhata.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "bank_accounts")
data class BankAccountEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val accountNumber: String,
    val balance: Double,
    val colorHex: String,
    val accountType: String = "savings"
)

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val phoneNumber: String = "",
    val address: String = "",
    val createdAt: String = ""
)

@Entity(tableName = "khata_transactions")
data class KhataTransactionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val customerId: Long,
    val amount: Double,
    val type: String, // "given" (उधारी दी) or "received" (जमा मिला)
    val date: String,
    val note: String = "",
    val createdAt: String = ""
)

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val amount: Double,
    val category: String,
    val date: String,
    val accountName: String = "",
    val note: String = ""
)
`
  );

  zip.file(
    `${packageDir}/data/Daos.kt`,
    `package com.merakhata.app.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface BankAccountDao {
    @Query("SELECT * FROM bank_accounts ORDER BY id ASC")
    fun getAllAccounts(): Flow<List<BankAccountEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAccount(account: BankAccountEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(accounts: List<BankAccountEntity>)

    @Update
    suspend fun updateAccount(account: BankAccountEntity)

    @Query("UPDATE bank_accounts SET balance = :newBalance WHERE id = :id")
    suspend fun updateBalance(id: Long, newBalance: Double)

    @Delete
    suspend fun deleteAccount(account: BankAccountEntity)
}

@Dao
interface CustomerDao {
    @Query("SELECT * FROM customers ORDER BY id DESC")
    fun getAllCustomers(): Flow<List<CustomerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(customers: List<CustomerEntity>)

    @Delete
    suspend fun deleteCustomer(customer: CustomerEntity)
}

@Dao
interface KhataTransactionDao {
    @Query("SELECT * FROM khata_transactions ORDER BY date DESC, id DESC")
    fun getAllTransactions(): Flow<List<KhataTransactionEntity>>

    @Query("SELECT * FROM khata_transactions WHERE customerId = :customerId ORDER BY date DESC, id DESC")
    fun getTransactionsForCustomer(customerId: Long): Flow<List<KhataTransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: KhataTransactionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(transactions: List<KhataTransactionEntity>)

    @Delete
    suspend fun deleteTransaction(transaction: KhataTransactionEntity)

    @Query("DELETE FROM khata_transactions WHERE customerId = :customerId")
    suspend fun deleteTransactionsForCustomer(customerId: Long)
}

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY date DESC, id DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(expenses: List<ExpenseEntity>)

    @Update
    suspend fun updateExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)
}
`
  );

  zip.file(
    `${packageDir}/data/AppDatabase.kt`,
    `package com.merakhata.app.data

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
                    "mera_khata_offline.db"
                )
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
                val udhariDao = database.udhariDao()
                val expenseDao = database.expenseDao()

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

                val initialUdhari = listOf(
                    UdhariEntity(personName = "रमेश भाई (Ramesh)", phoneNumber = "9876543210", amount = 5000.0, type = "lena", date = "2026-09-23", note = "दुकान के काम के लिए"),
                    UdhariEntity(personName = "शर्मा जी किराना", phoneNumber = "9812345678", amount = 2400.0, type = "lena", date = "2026-09-20", note = "पुराना बकाया"),
                    UdhariEntity(personName = "विकास इलेक्ट्रीशियन", phoneNumber = "9123456780", amount = 1200.0, type = "dena", date = "2026-09-24", note = "वायरिंग का बकाया"),
                    UdhariEntity(personName = "अमित कुमार", phoneNumber = "9988776655", amount = 850.0, type = "dena", date = "2026-09-21", note = "होटल बिल का हिस्सा")
                )
                udhariDao.insertAll(initialUdhari)

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
`
  );

  // README with clear build instructions
  zip.file(
    'README.md',
    `# Mera Khata - Native Android Application (Kotlin + Jetpack Compose)

This is a 100% offline Native Android Application built with Kotlin, Jetpack Compose, and Room Database.

## Features
- Home screen with Total Bank Balance, Total Udhari (Lena/Dena/Net), and Total Expenses
- 10-12+ Bank Accounts with direct balance editing
- Udhari ledger (credit/debit) with auto-calculations
- Daily Expenses tracking with automatic auto-totals
- 100% Offline with Room SQLite local database

## How to build APK (.apk):
1. Extract this ZIP file.
2. Open **Android Studio**.
3. Select **File > Open** and choose the extracted folder.
4. Let Gradle sync dependencies.
5. In the top menu, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Android Studio will generate the APK at:
   \`app/build/outputs/apk/debug/app-debug.apk\`
7. Transfer \`app-debug.apk\` to your phone and tap to install!
`
  );

  // Generate and download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'MeraKhata_Native_Android_Kotlin_Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
