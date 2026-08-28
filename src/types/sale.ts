export type SaleStatus = 'draft' | 'completed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'other';

export interface SaleItem {
  id: string;
  product_id: string;
  quantity: string;
  unit_price: number;
  unit_cost: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
  quantity_refunded: string;
  created_at: string;
}

export interface SalePayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference: string | null;
  created_at: string;
}

export interface Sale {
  id: string;
  business_id: string;
  location_id: string;
  customer_id: string | null;
  status: SaleStatus;
  sale_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  notes: string | null;
  completed_at: string | null;
  created_by: string | null;
  items: SaleItem[];
  payments: SalePayment[];
  created_at: string;
  updated_at: string;
}

export interface ListSalesParams {
  status?: SaleStatus;
  location_id?: string;
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}

export interface CreateSaleItemInput {
  product_id: string;
  quantity: string;
  unit_price: number;
  unit_cost: number;
  discount_amount?: number;
  tax_amount?: number;
}

export interface CreateSaleRequest {
  location_id: string;
  customer_id?: string;
  discount_amount?: number;
  notes?: string;
  items: CreateSaleItemInput[];
}

export interface UpdateSaleRequest {
  location_id?: string;
}

export interface CompleteSalePaymentInput {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface CompleteSaleRequest {
  payments: CompleteSalePaymentInput[];
}
