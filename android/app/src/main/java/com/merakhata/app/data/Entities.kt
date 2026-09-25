package com.merakhata.app.data

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
    val date: String, // YYYY-MM-DD
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
