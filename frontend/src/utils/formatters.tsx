/**
 * Format a number as currency
 * @param value Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | string | undefined,
  currency: string = "USD",
): string => {
  if (!value) return "$0.00";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Format a number as a percentage
 * @param value Number to format
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | string | undefined,
): string => {
  if (!value) return "0%";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(numValue / 100);
};
