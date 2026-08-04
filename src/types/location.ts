export interface Location {
  id: string;
  business_id: string;
  name: string;
  code?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country_code?: string;
  is_active?: boolean;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}
