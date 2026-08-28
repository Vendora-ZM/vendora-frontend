export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string;
  service_areas: string[];
  supplied_products: string[];
  operating_days: string | null;
  operating_hours: string | null;
  lead_time: string | null;
  payment_terms: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierPayload {
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country_code: string;
  service_areas?: string[];
  supplied_products?: string[];
  operating_days?: string | null;
  operating_hours?: string | null;
  lead_time?: string | null;
  payment_terms?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierPayload {
  name?: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country_code?: string;
  service_areas?: string[];
  supplied_products?: string[];
  operating_days?: string | null;
  operating_hours?: string | null;
  lead_time?: string | null;
  payment_terms?: string | null;
  notes?: string | null;
  is_active?: boolean;
}
