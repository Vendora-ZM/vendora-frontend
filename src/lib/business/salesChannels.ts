export type SalesChannelId =
  | 'walk_in'
  | 'pickup'
  | 'delivery'
  | 'online_order'
  | 'drive_thru'
  | 'dine_in'
  | 'table_service'
  | 'appointment'
  | 'home_service'
  | 'shipping';

export type SalesChannelOption = {
  id: SalesChannelId;
  label: string;
  description: string;
};

export const SALES_CHANNEL_OPTIONS: SalesChannelOption[] = [
  {
    id: 'walk_in',
    label: 'Walk-in',
    description: 'In-person sales at the counter or till.',
  },
  {
    id: 'pickup',
    label: 'Pickup',
    description: 'Orders collected from the store or branch.',
  },
  {
    id: 'delivery',
    label: 'Delivery',
    description: 'Orders delivered to the customer.',
  },
  {
    id: 'online_order',
    label: 'Online Order',
    description: 'Orders placed through a website or social channel.',
  },
  {
    id: 'drive_thru',
    label: 'Drive-Thru',
    description: 'Orders handed over to customers in vehicles.',
  },
  {
    id: 'dine_in',
    label: 'Dine-In',
    description: 'Restaurant sales consumed on site.',
  },
  {
    id: 'table_service',
    label: 'Table Service',
    description: 'Orders taken and served at a table.',
  },
  {
    id: 'appointment',
    label: 'Appointment',
    description: 'Sales tied to a booking or reserved time.',
  },
  {
    id: 'home_service',
    label: 'Home Service',
    description: 'Services completed at the customer location.',
  },
  {
    id: 'shipping',
    label: 'Shipping',
    description: 'Orders sent via courier or parcel delivery.',
  },
];

export const SALES_CHANNEL_STORAGE_PREFIX = 'vendora.settings.salesChannels.v1';

const RECOMMENDED_CHANNELS: Record<string, SalesChannelId[]> = {
  'retail-commerce': ['walk_in', 'pickup', 'online_order', 'shipping'],
  'food-beverage': ['walk_in', 'pickup', 'delivery', 'dine_in', 'table_service', 'drive_thru'],
  'pharmacy-healthcare': ['walk_in', 'pickup', 'delivery'],
  'beauty-personal-care': ['appointment', 'walk_in', 'home_service'],
  services: ['walk_in', 'appointment', 'home_service', 'pickup'],
  hospitality: ['walk_in', 'pickup', 'delivery', 'online_order'],
  entertainment: ['walk_in', 'online_order', 'pickup'],
  manufacturing: ['walk_in', 'pickup', 'shipping'],
  automotive: ['walk_in', 'appointment', 'pickup'],
  education: ['walk_in', 'appointment'],
  'professional-services': ['appointment', 'walk_in', 'online_order'],
  'non-profit': ['walk_in', 'online_order', 'pickup'],
  other: ['walk_in', 'pickup', 'delivery'],
};

export function getSalesChannelOption(id: SalesChannelId): SalesChannelOption {
  return SALES_CHANNEL_OPTIONS.find((option) => option.id === id) ?? SALES_CHANNEL_OPTIONS[0];
}

export function getRecommendedSalesChannels(categoryValue: string): SalesChannelId[] {
  return RECOMMENDED_CHANNELS[categoryValue] ?? RECOMMENDED_CHANNELS.other;
}

export function normalizeSalesChannels(values: string[]): SalesChannelId[] {
  const allowed = new Set(SALES_CHANNEL_OPTIONS.map((option) => option.id));
  const normalized = Array.from(new Set(values.filter((value): value is SalesChannelId => allowed.has(value as SalesChannelId))));

  return normalized.length > 0 ? normalized : RECOMMENDED_CHANNELS.other;
}
