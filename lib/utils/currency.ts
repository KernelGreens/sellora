const nairaFormatterOptions: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

function formatNumberWithFallback(amount: number) {
  try {
    return new Intl.NumberFormat("en-NG", nairaFormatterOptions).format(amount);
  } catch {
    try {
      return new Intl.NumberFormat("en", nairaFormatterOptions).format(amount);
    } catch {
      return amount.toFixed(2);
    }
  }
}

export function formatNaira(amount: number) {
  return `₦${formatNumberWithFallback(amount)}`;
}
