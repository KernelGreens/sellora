import { z } from "zod";
import { ORDER_STATUS_UPDATE_OPTIONS } from "@/lib/constants/order-status";
import { PAYMENT_STATUS_OPTIONS } from "@/lib/constants/payment-status";

export const createStorefrontOrderSchema = z.object({
  productId: z.cuid("Invalid product selected"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(50, "Quantity cannot be more than 50"),
  customerName: z
    .string()
    .trim()
    .min(2, "Your name must be at least 2 characters")
    .max(100, "Your name is too long"),
  customerPhone: z
    .string()
    .trim()
    .min(7, "Enter a valid WhatsApp number")
    .max(20, "WhatsApp number is too long"),
  customerEmail: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(120, "Email is too long")
    .optional()
    .or(z.literal("")),
  deliveryAddress: z
    .string()
    .trim()
    .min(5, "Enter a delivery address or pickup preference")
    .max(500, "Address is too long"),
  customerNote: z
    .string()
    .trim()
    .max(300, "Note is too long")
    .optional()
    .or(z.literal("")),
});

export type CreateStorefrontOrderInput = z.infer<
  typeof createStorefrontOrderSchema
>;

export const updateSellerOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_UPDATE_OPTIONS, {
    error: "Select a valid order status",
  }),
  note: z
    .string()
    .trim()
    .max(300, "Status note is too long")
    .optional()
    .or(z.literal("")),
});

export type UpdateSellerOrderStatusInput = z.infer<
  typeof updateSellerOrderStatusSchema
>;

const sellerOrderStatusFilterOptions = ["ALL", ...ORDER_STATUS_UPDATE_OPTIONS] as const;
const sellerPaymentStatusFilterOptions = ["ALL", ...PAYMENT_STATUS_OPTIONS] as const;
const adminOrderStatusFilterOptions = ["ALL", ...ORDER_STATUS_UPDATE_OPTIONS] as const;
const adminPaymentStatusFilterOptions = ["ALL", ...PAYMENT_STATUS_OPTIONS] as const;

export const sellerOrderHistoryFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(100, "Search query is too long")
    .optional()
    .or(z.literal("")),
  orderStatus: z
    .enum(sellerOrderStatusFilterOptions, {
      error: "Select a valid order status filter",
    })
    .optional(),
  paymentStatus: z
    .enum(sellerPaymentStatusFilterOptions, {
      error: "Select a valid payment status filter",
    })
    .optional(),
  page: z.coerce
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .optional(),
});

export type SellerOrderHistoryFiltersInput = z.infer<
  typeof sellerOrderHistoryFiltersSchema
>;

export const adminOrderFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(100, "Search query is too long")
    .optional()
    .or(z.literal("")),
  orderStatus: z
    .enum(adminOrderStatusFilterOptions, {
      error: "Select a valid order status filter",
    })
    .optional(),
  paymentStatus: z
    .enum(adminPaymentStatusFilterOptions, {
      error: "Select a valid payment status filter",
    })
    .optional(),
  page: z.coerce
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .optional(),
});

export type AdminOrderFiltersInput = z.infer<typeof adminOrderFiltersSchema>;
