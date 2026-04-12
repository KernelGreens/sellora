import { z } from "zod";

function isValidImageReference(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const imageReferenceSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || isValidImageReference(value),
    "Enter a valid image URL"
  )
  .optional()
  .or(z.literal(""));

const baseShopSchema = z.object({
  name: z
    .string()
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name is too long"),

  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),

  description: z
    .string()
    .max(300, "Description is too long")
    .optional()
    .or(z.literal("")),

  whatsappNumber: z
    .string()
    .min(7, "Enter a valid WhatsApp number")
    .max(20, "WhatsApp number is too long"),

  instagramHandle: z
    .string()
    .max(50, "Instagram handle is too long")
    .optional()
    .or(z.literal("")),

  bankName: z
    .string()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name is too long"),

  bankAccountName: z
    .string()
    .min(2, "Account name must be at least 2 characters")
    .max(100, "Account name is too long"),

  bankAccountNumber: z
    .string()
    .min(6, "Enter a valid account number")
    .max(30, "Account number is too long"),
});

export const createShopSchema = baseShopSchema;

export const updateShopSchema = baseShopSchema.extend({
  logoUrl: imageReferenceSchema,
  isActive: z.boolean().optional().default(true),
});

export const updateAdminShopStatusSchema = z.object({
  isActive: z.boolean({
    error: "Select a valid storefront status",
  }),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type UpdateAdminShopStatusInput = z.infer<typeof updateAdminShopStatusSchema>;
