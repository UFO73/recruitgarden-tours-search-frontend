export function formatCurrency(amount: number, currency: string, locale = 'uk-UA') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0
  }).format(amount);
}
