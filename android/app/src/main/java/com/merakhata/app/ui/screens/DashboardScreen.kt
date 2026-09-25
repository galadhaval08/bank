package com.merakhata.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.merakhata.app.data.BankAccountEntity
import com.merakhata.app.ui.ExpenseSummary
import com.merakhata.app.ui.UdhariSummary
import java.text.NumberFormat
import java.util.Locale

fun formatINR(amount: Double): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
    return formatter.format(amount).replace("INR", "₹")
}

@Composable
fun DashboardScreen(
    totalBalance: Double,
    udhariSummary: UdhariSummary,
    expenseSummary: ExpenseSummary,
    accounts: List<BankAccountEntity>,
    onNavigateAccounts: () -> Unit,
    onNavigateUdhari: () -> Unit,
    onNavigateExpenses: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // CARD 1: कुल बैंक बैलेंस
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onNavigateAccounts() },
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F766E))
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "कुल बैंक बैलेंस",
                        color = Color(0xFF99F6E4),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${accounts.size} खाते जुड़े हैं →",
                        color = Color(0xFFCCFBF1),
                        fontSize = 12.sp
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = formatINR(totalBalance),
                    color = Color.White,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.ExtraBold
                )

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = Color(0xFF14B8A6).copy(alpha = 0.3f))
                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "हर खाते का बैलेंस बदलने के लिए टैप करें",
                    color = Color(0xFFCCFBF1),
                    fontSize = 11.sp
                )
            }
        }

        // CARD 2: कुल उधारी (नेट, लेना है, देना है)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onNavigateUdhari() },
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "कुल उधारी (नेट बैलेंस)",
                        color = Color(0xFF64748B),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "खाता देखें →",
                        color = Color(0xFF4F46E5),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = formatINR(udhariSummary.netBalance),
                    color = if (udhariSummary.netBalance >= 0) Color(0xFF059669) else Color(0xFFE11D48),
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // मुझे लेना है
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5))
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(
                                text = "🟢 मुझे लेना है",
                                fontSize = 11.sp,
                                color = Color(0xFF065F46),
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "+${formatINR(udhariSummary.toReceive)}",
                                fontSize = 15.sp,
                                color = Color(0xFF047857),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // मुझे देना है
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F2))
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(
                                text = "🔴 मुझे देना है",
                                fontSize = 11.sp,
                                color = Color(0xFF9F1239),
                                fontWeight = FontWeight.SemiBold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "-${formatINR(udhariSummary.toPay)}",
                                fontSize = 15.sp,
                                color = Color(0xFFBE123C),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        // CARD 3: कुल खर्चा (आज, इस महीने, कुल जोड़)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onNavigateExpenses() },
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "कुल खर्चा",
                        color = Color(0xFF64748B),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "खर्च देखें →",
                        color = Color(0xFFD97706),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = formatINR(expenseSummary.monthTotal),
                    color = Color(0xFF1E293B),
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = "इस महीने का कुल खर्च",
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "आज का खर्च:", fontSize = 12.sp, color = Color(0xFF475569))
                        Text(text = formatINR(expenseSummary.todayTotal), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // 100% Offline Notice
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFE6FFFA), RoundedCornerShape(12.dp))
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                tint = Color(0xFF0F766E),
                modifier = Modifier.size(20.dp)
            )
            Text(
                text = "100% ऑफ़लाइन — डेटा सीधे आपके फ़ोन में Room SQLite में सेव है।",
                color = Color(0xFF115E59),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
