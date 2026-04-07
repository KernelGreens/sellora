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
