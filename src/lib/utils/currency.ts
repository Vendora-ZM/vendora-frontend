const DEFAULT_CURRENCY_CODE = 'USD';
const DEFAULT_LOCALE = 'en-US';

type CurrencyFormatOptions = {
  currencyCode?: string | null;
  fromMinorUnits?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
};

export function normalizeCurrencyCode(currencyCode?: string | null) {
  const normalized = currencyCode?.trim().toUpperCase();
  return normalized && /^[A-Z]{3}$/.test(normalized) ? normalized : DEFAULT_CURRENCY_CODE;
}

export function formatCurrency(
  value: number,
  {
    currencyCode,
    fromMinorUnits = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    locale = DEFAULT_LOCALE,
  }: CurrencyFormatOptions = {}
) {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const amount = fromMinorUnits ? value / 100 : value;
  const normalizedCurrencyCode = normalizeCurrencyCode(currencyCode);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: normalizedCurrencyCode,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    return `${normalizedCurrencyCode} ${amount.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    })}`;
  }
}

export function formatCurrencyFromCents(
  cents: number,
  options: Omit<CurrencyFormatOptions, 'fromMinorUnits'> = {}
) {
  return formatCurrency(cents, { ...options, fromMinorUnits: true });
}
