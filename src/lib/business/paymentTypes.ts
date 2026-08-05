import type { PaymentMethod } from '@/types/sale';

export const DEFAULT_PAYMENT_TYPES = ['Cash', 'Card', 'Mobile Money'];

export type PaymentTypeOption = {
  label: string;
  method: PaymentMethod;
};

function normalizeLabel(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
}

export function classifyPaymentTypeLabel(label: string): PaymentMethod {
  const normalized = normalizeLabel(label);

  if (!normalized) {
    return 'other';
  }
  if (/(cash|money in hand|cash drawer)/.test(normalized)) {
    return 'cash';
  }
  if (/(card|visa|mastercard|debit|credit)/.test(normalized)) {
    return 'card';
  }
  if (/(mobile money|money|wallet|airtel|mtn|zamtel|mpesa|ecocash|telecash|flouzz)/.test(normalized)) {
    return 'mobile_money';
  }
  if (/(bank|transfer|wire|eft|rtgs|deposit)/.test(normalized)) {
    return 'bank_transfer';
  }

  return 'other';
}

export function buildPaymentTypeOptions(paymentTypes?: string[] | null): PaymentTypeOption[] {
  const labels = (paymentTypes?.length ? paymentTypes : DEFAULT_PAYMENT_TYPES)
    .map((label) => label.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const options: PaymentTypeOption[] = [];

  for (const label of labels) {
    const key = label.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    options.push({ label, method: classifyPaymentTypeLabel(label) });
  }

  if (options.length === 0) {
    return DEFAULT_PAYMENT_TYPES.map((label) => ({
      label,
      method: classifyPaymentTypeLabel(label),
    }));
  }

  return options;
}

export function getPaymentTypeLabel(method: PaymentMethod, paymentTypes?: string[] | null) {
  const option = buildPaymentTypeOptions(paymentTypes).find((entry) => entry.method === method);
  if (option) {
    return option.label;
  }

  switch (method) {
    case 'cash':
      return 'Cash';
    case 'card':
      return 'Card';
    case 'mobile_money':
      return 'Mobile Money';
    case 'bank_transfer':
      return 'Bank Transfer';
    default:
      return 'Other';
  }
}
