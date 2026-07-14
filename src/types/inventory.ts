export interface InventoryBalance {
  id: string;
  business_id: string;
  location_id: string;
  product_id: string;
  quantity_on_hand: string;
  quantity_reserved: string;
  quantity_available: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  business_id: string;
  location_id: string;
  product_id: string;
  movement_type: string;
  quantity_delta: string;
  reserved_delta: string;
  quantity_before: string;
  quantity_after: string;
  reserved_before: string;
  reserved_after: string;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface AdjustStockRequest {
  location_id: string;
  product_id: string;
  quantity_delta: string;
  notes?: string;
}

export interface TransferStockRequest {
  from_location_id: string;
  to_location_id: string;
  product_id: string;
  quantity: string;
  notes?: string;
}

export interface GetBalancesParams {
  location_id?: string;
  product_id?: string;
}

export interface GetMovementsParams {
  location_id?: string;
  product_id?: string;
  limit?: number;
  offset?: number;
}
