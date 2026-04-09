export type SellerProductVisibilityFilter = "ALL" | "ACTIVE" | "HIDDEN";

export type SellerProductStockFilter =
  | "ALL"
  | "HEALTHY"
  | "LOW"
  | "OUT"
  | "UNTRACKED";

export type SellerProductStockState = Exclude<
  SellerProductStockFilter,
  "ALL"
>;

export type SellerProductListItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  stockQuantity: number | null;
  stockState: SellerProductStockState;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  imageUrl: string;
  isActive: boolean;
};

export type SellerProductListSummary = {
  totalProducts: number;
  activeProducts: number;
  hiddenProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
};

export type SellerProductListFilters = {
  query: string;
  visibility: SellerProductVisibilityFilter;
  stockStatus: SellerProductStockFilter;
};

export type SellerProductListPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type SellerProductListData = {
  shopName: string;
  shopSlug: string;
  products: SellerProductListItem[];
  summary: SellerProductListSummary;
  filters: SellerProductListFilters;
  pagination: SellerProductListPagination;
};

export type SellerProductEditData = {
  id: string;
  shopName: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number | null;
  imageUrl: string | null;
  isActive: boolean;
};
