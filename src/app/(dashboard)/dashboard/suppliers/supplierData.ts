export type SupplierRecord = {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  serviceAreas: string[];
  suppliedProducts: string[];
  operatingDays: string;
  operatingHours: string;
  leadTime: string;
  paymentTerms: string;
  notes: string;
};

export type SupplierFormState = {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  serviceAreas: string;
  suppliedProducts: string;
  operatingDays: string;
  operatingHours: string;
  leadTime: string;
  paymentTerms: string;
  notes: string;
};

export const SUPPLIERS_STORAGE_KEY = 'vendora.suppliers';

export const INITIAL_FORM: SupplierFormState = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  serviceAreas: '',
  suppliedProducts: '',
  operatingDays: '',
  operatingHours: '',
  leadTime: '',
  paymentTerms: '',
  notes: '',
};

export const INITIAL_SUPPLIERS: SupplierRecord[] = [
  {
    id: 'supplier-1',
    name: 'FreshRoute Distributors',
    contactName: 'Loveness Phiri',
    phone: '+260 977 120 455',
    email: 'orders@freshroute.co.zm',
    address: 'Plot 28, Makeni, Lusaka',
    serviceAreas: ['Lusaka', 'Kafue'],
    suppliedProducts: ['Cooking Oil', 'Rice 25kg', 'Sugar 10kg'],
    operatingDays: 'Mon - Sat',
    operatingHours: '08:00 - 17:30',
    leadTime: '24 hours',
    paymentTerms: 'Net 7 days',
    notes: 'Strong for fast-moving essentials. Usually confirms restocks by phone before noon.',
  },
  {
    id: 'supplier-2',
    name: 'Copperbelt Packaging House',
    contactName: 'Brian Chansa',
    phone: '+260 966 884 230',
    email: 'supply@cbpackaging.com',
    address: 'Industrial Yard 4, Ndola',
    serviceAreas: ['Ndola', 'Kitwe', 'Lusaka'],
    suppliedProducts: ['Carry Bags', 'Receipt Rolls', 'Branded Boxes'],
    operatingDays: 'Mon - Fri',
    operatingHours: '07:30 - 16:30',
    leadTime: '2-3 days',
    paymentTerms: '50% upfront',
    notes: 'Best for custom packaging orders. Use them when branded materials need a larger run.',
  },
];

export function toTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function readSuppliers(): SupplierRecord[] {
  if (typeof window === 'undefined') {
    return INITIAL_SUPPLIERS;
  }

  try {
    const raw = window.localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    if (!raw) {
      return INITIAL_SUPPLIERS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return INITIAL_SUPPLIERS;
    }

    return parsed as SupplierRecord[];
  } catch {
    return INITIAL_SUPPLIERS;
  }
}

export function writeSuppliers(suppliers: SupplierRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
}

export function hydrateSuppliers() {
  const suppliers = readSuppliers();
  writeSuppliers(suppliers);
  return suppliers;
}

export function createSupplierRecord(form: SupplierFormState): SupplierRecord {
  const cleanName = form.name.trim();
  const baseSlug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'supplier';

  return {
    id: `${baseSlug}-${Date.now()}`,
    name: cleanName,
    contactName: form.contactName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    serviceAreas: toTags(form.serviceAreas),
    suppliedProducts: toTags(form.suppliedProducts),
    operatingDays: form.operatingDays.trim(),
    operatingHours: form.operatingHours.trim(),
    leadTime: form.leadTime.trim(),
    paymentTerms: form.paymentTerms.trim(),
    notes: form.notes.trim(),
  };
}
export function createSupplierFormState(supplier: SupplierRecord): SupplierFormState {
  return {
    name: supplier.name,
    contactName: supplier.contactName,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    serviceAreas: supplier.serviceAreas.join(', '),
    suppliedProducts: supplier.suppliedProducts.join(', '),
    operatingDays: supplier.operatingDays,
    operatingHours: supplier.operatingHours,
    leadTime: supplier.leadTime,
    paymentTerms: supplier.paymentTerms,
    notes: supplier.notes,
  };
}

export function updateSupplierRecord(supplier: SupplierRecord, form: SupplierFormState): SupplierRecord {
  return {
    ...supplier,
    name: form.name.trim(),
    contactName: form.contactName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    serviceAreas: toTags(form.serviceAreas),
    suppliedProducts: toTags(form.suppliedProducts),
    operatingDays: form.operatingDays.trim(),
    operatingHours: form.operatingHours.trim(),
    leadTime: form.leadTime.trim(),
    paymentTerms: form.paymentTerms.trim(),
    notes: form.notes.trim(),
  };
}
