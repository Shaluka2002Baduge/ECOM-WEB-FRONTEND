/**
 * Raalahami Restaurant - Sri Lankan Rupee (Rs.) Currency Utility
 * Centralized formatting for currency values across the entire presentation tier
 */

export const formatPrice = (price) => {
  const num = Number(price) || 0;
  return `Rs. ${num.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatCurrency = (amount, includeDecimals = false) => {
  if (includeDecimals) {
    const num = Number(amount) || 0;
    return `Rs. ${num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return formatPrice(amount);
};

export default formatPrice;
