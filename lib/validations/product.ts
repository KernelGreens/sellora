import { z } from "zod";

export const sellerProductVisibilityFilterOptions = [
  "ALL",
  "ACTIVE",
  "HIDDEN",
] as const;

export const sellerProductStockFilterOptions = [
  "ALL",
  "HEALTHY",
  "LOW",
  "OUT",
  "UNTRACKED",
] as const;

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name is too long"),

  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0"),

  stockQuantity: z
    .union([
      z.coerce
        .number()
        .int("Stock quantity must be a whole number")
        .min(0, "Stock quantity cannot be negative"),
      z.null(),
    ])
    .optional(),

  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().optional().default(true),
});

export const createManyProductsSchema = z.object({
  products: z.array(createProductSchema).min(1, "Add at least one product"),
});

export const sellerProductListFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(100, "Search query is too long")
    .optional()
    .or(z.literal("")),
  visibility: z
    .enum(sellerProductVisibilityFilterOptions, {
      error: "Select a valid visibility filter",
    })
    .optional(),
  stockStatus: z
    .enum(sellerProductStockFilterOptions, {
      error: "Select a valid stock filter",
    })
    .optional(),
  page: z.coerce
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type SellerProductListFiltersInput = z.infer<
  typeof sellerProductListFiltersSchema
>;
