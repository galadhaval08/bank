/**
 * Format numbers according to the Indian Numbering System (e.g. 1,00,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatDateLabel(dateString: string, lang: 'hi' | 'en' = 'hi'): string {
  if (!dateString) return '';
  const today = new Date().toISOString().split('T')[0];
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (dateString === today) {
    return lang === 'hi' ? 'आज' : 'Today';
  }
  if (dateString === yesterday) {
    return lang === 'hi' ? 'कल' : 'Yesterday';
  }

  try {
    const [y, m, d] = dateString.split('-');
    const monthsHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(m, 10) - 1;
    if (lang === 'hi') {
      return `${parseInt(d, 10)} ${monthsHi[mIdx] || m} ${y}`;
    }
    return `${parseInt(d, 10)} ${monthsEn[mIdx] || m} ${y}`;
  } catch {
    return dateString;
  }
}
