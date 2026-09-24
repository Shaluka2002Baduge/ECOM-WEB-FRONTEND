/**
 * Raalahami Restaurant - Sri Lankan Rupee (Rs.) Currency Utility
 * Centralized formatting for currency values across the entire presentation tier
 */
export const formatCurrency = (amount, includeDecimals = false) => {
  if (amount == null || isNaN(amount)) return 'Rs. 0';
  const num = Number(amount);
  return `Rs. ${num.toLocaleString('en-LK', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
};

export default formatCurrency;
