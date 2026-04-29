/**
 * Formats a number as Indian Rupee (INR) string.
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted string (e.g., ₹1,234.56)
 */
export const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
};
