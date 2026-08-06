export type BusinessCategory = {
  label: string;
  value: string;
  types: string[];
  description: string;
};

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    label: 'Retail & Commerce',
    value: 'retail-commerce',
    description: 'For merchants who sell products in-store, online, or both.',
    types: [
      'Retail Store',
      'Supermarket',
      'Online Store',
      'Boutique / Fashion Store',
      'Shoe Store',
      'Electronics Store',
      'Furniture Store',
      'Home & Kitchen Store',
      'Hardware Store',
      'Building Materials Store',
      'Bookstore',
      'Gift Shop',
      'Toy Store',
      'Jewelry Store',
      'Cosmetics & Beauty Store',
      'Florist',
      'Stationery Store',
      'Sports & Fitness Store',
      'Wholesale Store',
    ],
  },
  {
    label: 'Food & Beverage',
    value: 'food-beverage',
    description: 'For businesses serving meals, drinks, and baked goods.',
    types: ['Restaurant', 'Fast Food Restaurant', 'Café', 'Bakery', 'Bar and Pub', 'Butchery'],
  },
  {
    label: 'Pharmacy & Healthcare',
    value: 'pharmacy-healthcare',
    description: 'For pharmacies, clinics, and medical supply businesses.',
    types: [
      'Pharmacy',
      'Clinic and Hospital',
      'Agro - Veterinary Store',
      'Optical Shop',
      'Laboratory',
      'Physiotherapy Centre',
      'Gym and Wellness Centre',
      'Medical Supplies Store',
    ],
  },
  {
    label: 'Beauty & Personal Care',
    value: 'beauty-personal-care',
    description: 'For appointment-based service providers and personal grooming shops.',
    types: ['Salon', 'Barbershop', 'Spa', 'Nail Studio', 'Tattoo Studio'],
  },
  {
    label: 'Services',
    value: 'services',
    description: 'For businesses that sell labour, repairs, or delivery services.',
    types: [
      'Laundry',
      'Dry Cleaning',
      'Car Wash',
      'Auto Repair Garage',
      'Printing Shop',
      'Photography Studio',
      'Courier Service',
      'Cleaning Services',
      'Repair Shop',
      'Tailoring Shop',
    ],
  },
  {
    label: 'Hospitality',
    value: 'hospitality',
    description: 'For accommodation and guest services.',
    types: ['Hotel', 'Motel', 'Lodge', 'Guest House', 'Resort', 'Hostel', 'Airbnb Property / House for Rent'],
  },
  {
    label: 'Entertainment',
    value: 'entertainment',
    description: 'For venues and entertainment-focused operations.',
    types: ['Cinema', 'Gaming Centre', 'Event Centre'],
  },
  {
    label: 'Manufacturing',
    value: 'manufacturing',
    description: 'For businesses that make goods in-house.',
    types: [
      'Manufacturing Company',
      'Food Processing',
      'Beverage Manufacturing',
      'Textile Manufacturing',
      'Furniture Manufacturing',
      'Pharmaceutical Manufacturing',
    ],
  },
  {
    label: 'Automotive',
    value: 'automotive',
    description: 'For dealerships, parts shops, and fuel stations.',
    types: ['Car Dealership', 'Spare Parts Store', 'Fuel Station', 'Auto Accessories Store'],
  },
  {
    label: 'Education',
    value: 'education',
    description: 'For schools, colleges, and training providers.',
    types: ['School', 'University / College', 'Training Centre'],
  },
  {
    label: 'Professional Services',
    value: 'professional-services',
    description: 'For firms that sell specialist knowledge and advisory work.',
    types: ['Accounting Firm', 'Law Firm', 'Consulting Firm', 'Marketing Agency', 'Software Company'],
  },
  {
    label: 'Religious & Non-Profit Organizations',
    value: 'non-profit',
    description: 'For organizations serving communities and causes.',
    types: ['Religious Bookshop', 'NGO', 'Charity', 'Foundation'],
  },
  {
    label: 'Other',
    value: 'other',
    description: 'For a custom business type not listed above.',
    types: ['Other (Custom Business Type)'],
  },
];

export const BUSINESS_HIGHLIGHTS: Record<string, string[]> = {
  'retail-commerce': ['Barcode-friendly checkout', 'Stock control', 'Branch management'],
  'food-beverage': ['Table service', 'Modifiers', 'Kitchen-friendly sales'],
  'pharmacy-healthcare': ['Expiry-aware inventory', 'Dose-sensitive selling', 'Controlled access'],
  'beauty-personal-care': ['Appointments', 'Customer profiles', 'Staff commissions'],
  services: ['Bookings', 'Service line items', 'Team permissions'],
  hospitality: ['Room or property sales', 'Multi-location views', 'Guest-ready receipts'],
  entertainment: ['Event sales', 'Fast payments', 'Attendance-aware workflows'],
  manufacturing: ['Production tracking', 'Bulk materials', 'Warehouse control'],
  automotive: ['Parts catalog', 'Quick lookup', 'Branch inventory'],
  education: ['Student-oriented sales', 'Membership options', 'Team access'],
  'professional-services': ['Client records', 'Professional billing', 'Simple receipts'],
  'non-profit': ['Donation tracking', 'Member records', 'Simple admin tools'],
  other: ['Custom setup', 'Flexible fields', 'General POS workflows'],
};

export function getBusinessCategory(value: string) {
  return BUSINESS_CATEGORIES.find((entry) => entry.value === value) ?? BUSINESS_CATEGORIES[0];
}
