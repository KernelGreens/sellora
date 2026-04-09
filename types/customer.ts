export type SellerCustomerRelationshipFilter = "ALL" | "NEW" | "REPEAT";

export type SellerCustomerRelationship = Exclude<
  SellerCustomerRelationshipFilter,
  "ALL"
>;

export type SellerCustomerListItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  orderCount: number;
  paidOrderCount: number;
  totalSpent: number;
  latestOrderId: string | null;
  latestOrderNumber: string | null;
  lastOrderAt: string | null;
  createdAt: string;
  relationship: SellerCustomerRelationship;
};

export type SellerCustomerListSummary = {
  totalCustomers: number;
  firstTimeCustomers: number;
  repeatCustomers: number;
  customersAddedThisMonth: number;
};

export type SellerCustomerListFilters = {
  query: string;
  relationship: SellerCustomerRelationshipFilter;
};

export type SellerCustomerListPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type SellerCustomerListData = {
  shopName: string;
  shopSlug: string;
  customers: SellerCustomerListItem[];
  summary: SellerCustomerListSummary;
  filters: SellerCustomerListFilters;
  pagination: SellerCustomerListPagination;
};

export type SellerCustomerOrderHistoryItem = {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  orderStatus:
    | "NEW"
    | "AWAITING_PAYMENT"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "COMPLETED"
    | "CANCELLED";
  itemCount: number;
  productSummary: string;
  customerNote: string | null;
};

export type SellerCustomerDetailData = {
  id: string;
  shopName: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  relationship: SellerCustomerRelationship;
  orderCount: number;
  paidOrderCount: number;
  totalSpent: number;
  latestOrderAt: string | null;
  orders: SellerCustomerOrderHistoryItem[];
};
