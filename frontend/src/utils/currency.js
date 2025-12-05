/**
 * Format a number as Egyptian Pound currency
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'EGP 0.00';
  }
  return `EGP ${parseFloat(amount).toFixed(decimals)}`;
};

/**
 * Format a number as Egyptian Pound currency without decimals
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrencyNoDecimals = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'EGP 0';
  }
  return `EGP ${Math.round(parseFloat(amount))}`;
};

