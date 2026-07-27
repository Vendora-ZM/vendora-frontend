export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  cost_price: number;
  selling_price: number;
  unit: string;
  barcode: string | null;
  is_taxable: boolean;
  tax_rate: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
}

export interface CreateProductPayload {
  category_id?: string | null;
  sku: string;
  name: string;
  description?: string | null;
  cost_price?: number;
  selling_price?: number;
  unit?: string;
  barcode?: string | null;
  is_taxable?: boolean;
  tax_rate?: string;
}

export interface UpdateProductPayload {
  category_id?: string | null;
  sku?: string;
  name?: string;
  description?: string | null;
  cost_price?: number;
  selling_price?: number;
  unit?: string;
  barcode?: string | null;
  is_taxable?: boolean;
  tax_rate?: string;
  is_active?: boolean;
}

export interface ListProductsParams {
  search?: string;
  category_id?: string;
}
