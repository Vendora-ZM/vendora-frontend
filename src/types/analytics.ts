export interface SalesTrendPoint {
  date: string;
  location_id: string;
  revenue: number;
  cost: number;
  tax_amount: number;
  sale_count: number;
  refund_amount: number;
  refund_count: number;
}

export interface TopProductRow {
  product_id: string;
  product_name: string;
  sku: string;
  quantity_sold: string;
  quantity_refunded: string;
  revenue: number;
  cost: number;
}

export interface InventoryTurnoverRow {
  product_id: string;
  product_name: string;
  sku: string;
  quantity_sold: string;
  avg_on_hand: string;
  turnover_rate: string;
}

export interface AnalyticsFilterParams {
  from: string; // ISO Date String
  to: string; // ISO Date String
  location_id?: string;
  limit?: number; // Only for top products or inventory turnover
}
