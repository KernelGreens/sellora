import type { PaymentStatus } from "@/lib/generated/prisma/client";

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  PAID: {
    label: "Paid",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  FAILED: {
    label: "Failed",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  REFUNDED: {
    label: "Refunded",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

export function getPaymentStatusMeta(status: PaymentStatus) {
  return PAYMENT_STATUS_META[status];
}

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];
