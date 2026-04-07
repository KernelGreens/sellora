import type { OrderStatus, PaymentStatus } from "@/lib/generated/prisma";

export type SellerOrderListItem = {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  productSummary: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
};

export type SellerOrderListSummary = {
  totalOrders: number;
  newOrders: number;
  awaitingPaymentOrders: number;
  paidOrders: number;
  collectedRevenue: number;
};

export type SellerOrderListData = {
  shopName: string;
  orders: SellerOrderListItem[];
  summary: SellerOrderListSummary;
};

export type SellerOrderDetailItem = {
  id: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type SellerOrderStatusLogEntry = {
  id: string;
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  note: string | null;
  changedAt: string;
};

export type SellerOrderDetailData = {
  id: string;
  orderNumber: string;
  shopName: string;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  deliveryFee: number | null;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentReference: string | null;
  paymentProofUrl: string | null;
  deliveryAddress: string;
  customerNote: string | null;
  internalNote: string | null;
  itemCount: number;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    createdAt: string;
  };
  items: SellerOrderDetailItem[];
  statusLogs: SellerOrderStatusLogEntry[];
};
