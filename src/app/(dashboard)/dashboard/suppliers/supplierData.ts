import { CreateSupplierPayload, Supplier, UpdateSupplierPayload } from '@/types/supplier';

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

export function toTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function createSupplierFormState(supplier: Supplier): SupplierFormState {
  return {
    name: supplier.name,
    contactName: supplier.contact_name ?? '',
    phone: supplier.phone ?? '',
    email: supplier.email ?? '',
    address: supplier.address_line1 ?? '',
    serviceAreas: supplier.service_areas.join(', '),
    suppliedProducts: supplier.supplied_products.join(', '),
    operatingDays: supplier.operating_days ?? '',
    operatingHours: supplier.operating_hours ?? '',
    leadTime: supplier.lead_time ?? '',
    paymentTerms: supplier.payment_terms ?? '',
    notes: supplier.notes ?? '',
  };
}

export function toCreateSupplierPayload(form: SupplierFormState): CreateSupplierPayload {
  return {
    name: form.name.trim(),
    contact_name: toOptionalString(form.contactName),
    phone: toOptionalString(form.phone),
    email: toOptionalString(form.email),
    address_line1: toOptionalString(form.address),
    country_code: 'ZM',
    service_areas: toTags(form.serviceAreas),
    supplied_products: toTags(form.suppliedProducts),
    operating_days: toOptionalString(form.operatingDays),
    operating_hours: toOptionalString(form.operatingHours),
    lead_time: toOptionalString(form.leadTime),
    payment_terms: toOptionalString(form.paymentTerms),
    notes: toOptionalString(form.notes),
  };
}

export function toUpdateSupplierPayload(form: SupplierFormState, supplier: Supplier): UpdateSupplierPayload {
  return {
    name: form.name.trim(),
    contact_name: toOptionalString(form.contactName),
    phone: toOptionalString(form.phone),
    email: toOptionalString(form.email),
    address_line1: toOptionalString(form.address),
    country_code: supplier.country_code || 'ZM',
    service_areas: toTags(form.serviceAreas),
    supplied_products: toTags(form.suppliedProducts),
    operating_days: toOptionalString(form.operatingDays),
    operating_hours: toOptionalString(form.operatingHours),
    lead_time: toOptionalString(form.leadTime),
    payment_terms: toOptionalString(form.paymentTerms),
    notes: toOptionalString(form.notes),
    is_active: supplier.is_active,
  };
}

export function formatSupplierAddress(supplier: Supplier) {
  return [
    supplier.address_line1,
    supplier.address_line2,
    supplier.city,
    supplier.state,
    supplier.postal_code,
  ].filter(Boolean).join(', ');
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    if ('data' in error && error.data && typeof error.data === 'object') {
      const payload = error.data as { message?: string; error?: string };
      return payload.message || payload.error || fallback;
    }

    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }

  return fallback;
}
