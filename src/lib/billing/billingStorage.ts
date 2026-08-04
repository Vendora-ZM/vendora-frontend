export type BillingPlanId = 'starter' | 'growth' | 'enterprise';

export type BillingPaymentMethodId = 'lipila_mobile_money' | 'card' | 'bank_transfer';

export const BILLING_PLANS: Array<{
  id: BillingPlanId;
  name: string;
  priceLabel: string;
  description: string;
  features: string[];
}> = [
  {
    id: 'starter',
    name: 'Starter',
    priceLabel: 'K99 / month',
    description: 'For single-location businesses that need a reliable POS and basic reports.',
    features: ['1 location', 'POS and receipts', 'Basic reports'],
  },
  {
    id: 'growth',
    name: 'Growth',
    priceLabel: 'K199 / month',
    description: 'For businesses expanding into more than one branch.',
    features: ['Multiple locations', 'Employee permissions', 'Advanced reports'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Custom',
    description: 'For larger teams that need rollout support and tailored workflows.',
    features: ['Unlimited locations', 'Custom onboarding', 'Priority support'],
  },
];

export const BILLING_PAYMENT_METHODS: Array<{
  id: BillingPaymentMethodId;
  name: string;
  description: string;
  detail: string;
}> = [
  {
    id: 'lipila_mobile_money',
    name: 'Lipila Mobile Money',
    description: 'Mobile money checkout with quick confirmation.',
    detail: 'Best for Airtel Money, MTN Money, and similar local wallet flows.',
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Visa or Mastercard recurring payment.',
    detail: 'Use for businesses that prefer direct card billing.',
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Pay from a business account by transfer.',
    detail: 'Useful for finance teams that want invoices and manual settlement.',
  },
];
