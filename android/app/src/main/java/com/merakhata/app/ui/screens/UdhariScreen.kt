package com.merakhata.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.merakhata.app.data.CustomerEntity
import com.merakhata.app.data.KhataTransactionEntity
import com.merakhata.app.ui.UdhariSummary

@Composable
fun UdhariScreen(
    customers: List<CustomerEntity>,
    transactions: List<KhataTransactionEntity>,
    summary: UdhariSummary,
    onAddCustomer: (String, String, String) -> Unit,
    onDeleteCustomer: (CustomerEntity) -> Unit,
    onAddTransaction: (Long, Double, String, String, String) -> Unit,
    onDeleteTransaction: (KhataTransactionEntity) -> Unit
) {
    var selectedCustomer by remember { mutableStateOf<CustomerEntity?>(null) }
    var showAddCustomerDialog by remember { mutableStateOf(false) }
    var showAddTxDialog by remember { mutableStateOf(false) }
    var txTypeMode by remember { mutableStateOf("given") } // "given" (उधार दिया) or "received" (जमा मिला)

    // DETAIL CUSTOMER PASSBOOK VIEW
    if (selectedCustomer != null) {
        val cust = selectedCustomer!!
        val custTxs = transactions.filter { it.customerId == cust.id }
        val totalGiven = custTxs.filter { it.type == "given" }.sumOf { it.amount }
        val totalReceived = custTxs.filter { it.type == "received" }.sumOf { it.amount }
        val netBalance = totalGiven - totalReceived

        Scaffold(
            topBar = {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { selectedCustomer = null }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = cust.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            if (cust.phoneNumber.isNotEmpty()) {
                                Text(text = cust.phoneNumber, fontSize = 12.sp, color = Color(0xFF64748B))
                            }
                        }
                    }
                }
            },
            bottomBar = {
                // Khatabook style 2 Big Buttons: दिया / मिला
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            txTypeMode = "given"
                            showAddTxDialog = true
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("🔴 उधारी दी (दिया ₹)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                    Button(
                        onClick = {
                            txTypeMode = "received"
                            showAddTxDialog = true
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("🟢 जमा मिला (आया ₹)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    // Balance card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (netBalance >= 0) Color(0xFF059669) else Color(0xFFE11D48)
                        )
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = if (netBalance >= 0) "🟢 आपको लेना है" else "🔴 आपको देना है",
                                color = Color.White.copy(alpha = 0.9f),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = formatINR(Math.abs(netBalance)),
                                color = Color.White,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Black
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            HorizontalDivider(color = Color.White.copy(alpha = 0.2f))
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("उधारी दी: +${formatINR(totalGiven)}", color = Color.White, fontSize = 11.sp)
                                Text("जमा मिला: -${formatINR(totalReceived)}", color = Color.White, fontSize = 11.sp)
                            }
                        }
                    }
                }

                items(custTxs) { tx ->
                    val isGiven = tx.type == "given"
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = if (isGiven) "उधारी दी (You Gave)" else "जमा मिला (You Got)",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = if (isGiven) Color(0xFFE11D48) else Color(0xFF059669)
                                )
                                if (tx.note.isNotEmpty()) {
                                    Text(text = tx.note, fontSize = 12.sp, color = Color(0xFF334155))
                                }
                                Text(text = tx.date, fontSize = 10.sp, color = Color(0xFF94A3B8))
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "${if (isGiven) "+" else "-"}${formatINR(tx.amount)}",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 15.sp,
                                    color = if (isGiven) Color(0xFFE11D48) else Color(0xFF059669)
                                )
                                IconButton(onClick = { onDeleteTransaction(tx) }) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFCBD5E1))
                                }
                            }
                        }
                    }
                }
            }
        }

        // Add Transaction Dialog
        if (showAddTxDialog) {
            var amountText by remember { mutableStateOf("") }
            var note by remember { mutableStateOf("") }
            val todayDate = java.time.LocalDate.now().toString()

            AlertDialog(
                onDismissRequest = { showAddTxDialog = false },
                title = { Text(if (txTypeMode == "given") "उधारी दी (You Gave)" else "जमा मिला (You Got)") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = amountText,
                            onValueChange = { amountText = it },
                            label = { Text("रकम (₹)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = note,
                            onValueChange = { note = it },
                            label = { Text("विवरण / सामान (नोट)") },
                            singleLine = true
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val parsed = amountText.toDoubleOrNull()
                            if (parsed != null && parsed > 0) {
                                onAddTransaction(cust.id, parsed, txTypeMode, todayDate, note.trim())
                                showAddTxDialog = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (txTypeMode == "given") Color(0xFFE11D48) else Color(0xFF059669)
                        )
                    ) {
                        Text("सेव करें")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAddTxDialog = false }) { Text("रद्द करें") }
                }
            )
        }

        return
    }

    // MAIN CUSTOMERS LIST VIEW
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddCustomerDialog = true },
                containerColor = Color(0xFF0F766E),
                contentColor = Color.White
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = "Add Customer")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                // Header Auto-Calculated Summary
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "ग्राहक उधारी खाता (Customer Khata Book)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color(0xFF1E293B)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Card(
                                modifier = Modifier.weight(1f),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5))
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("लेना है", fontSize = 10.sp, color = Color(0xFF065F46), fontWeight = FontWeight.Bold)
                                    Text("+${formatINR(summary.toReceive)}", fontSize = 14.sp, color = Color(0xFF047857), fontWeight = FontWeight.ExtraBold)
                                }
                            }
                            Card(
                                modifier = Modifier.weight(1f),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F2))
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("देना है", fontSize = 10.sp, color = Color(0xFF9F1239), fontWeight = FontWeight.Bold)
                                    Text("-${formatINR(summary.toPay)}", fontSize = 14.sp, color = Color(0xFFBE123C), fontWeight = FontWeight.ExtraBold)
                                }
                            }
                            Card(
                                modifier = Modifier.weight(1f),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9))
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("नेट बैलेंस", fontSize = 10.sp, color = Color(0xFF475569), fontWeight = FontWeight.Bold)
                                    Text(
                                        formatINR(summary.netBalance),
                                        fontSize = 14.sp,
                                        color = if (summary.netBalance >= 0) Color(0xFF059669) else Color(0xFFE11D48),
                                        fontWeight = FontWeight.Black
                                    )
                                }
                            }
                        }
                    }
                }
            }

            items(customers, key = { it.id }) { cust ->
                val custTxs = transactions.filter { it.customerId == cust.id }
                val given = custTxs.filter { it.type == "given" }.sumOf { it.amount }
                val recd = custTxs.filter { it.type == "received" }.sumOf { it.amount }
                val net = given - recd

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedCustomer = cust },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = cust.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color(0xFF0F172A))
                            Text(text = "${custTxs.size} लेन-देन • खाता खोलें →", fontSize = 11.sp, color = Color(0xFF0F766E), fontWeight = FontWeight.Medium)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = if (net == 0.0) "₹0" else "${if (net > 0) "+" else "-"}${formatINR(Math.abs(net))}",
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                color = if (net == 0.0) Color(0xFF94A3B8) else if (net > 0) Color(0xFF059669) else Color(0xFFE11D48)
                            )
                            Text(
                                text = if (net == 0.0) "बराबर" else if (net > 0) "लेना है" else "देना है",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (net == 0.0) Color(0xFF94A3B8) else if (net > 0) Color(0xFF059669) else Color(0xFFE11D48)
                            )
                        }
                    }
                }
            }
        }
    }

    // Add Customer Dialog
    if (showAddCustomerDialog) {
        var name by remember { mutableStateOf("") }
        var phone by remember { mutableStateOf("") }
        var address by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddCustomerDialog = false },
            title = { Text("नया ग्राहक जोड़ें") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("ग्राहक का नाम *") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("मोबाइल नंबर (वैकल्पिक)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("पता / दुकान (वैकल्पिक)") },
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (name.isNotBlank()) {
                            onAddCustomer(name.trim(), phone.trim(), address.trim())
                            showAddCustomerDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F766E))
                ) {
                    Text("जोड़ें")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddCustomerDialog = false }) { Text("रद्द करें") }
            }
        )
    }
}
