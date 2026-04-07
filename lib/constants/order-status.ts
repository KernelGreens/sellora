import type { OrderStatus } from "@/lib/generated/prisma";

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "New",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  AWAITING_PAYMENT: {
    label: "Awaiting Payment",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  PAID: {
    label: "Paid",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PROCESSING: {
    label: "Processing",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  SHIPPED: {
    label: "Shipped",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export function getOrderStatusMeta(status: OrderStatus) {
  return ORDER_STATUS_META[status];
}
