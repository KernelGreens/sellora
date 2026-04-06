import { z } from "zod";

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
