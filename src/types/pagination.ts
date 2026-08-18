export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
}

export interface PaginatedListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
