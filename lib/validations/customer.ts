import { z } from "zod";

export const sellerCustomerRelationshipFilterOptions = [
  "ALL",
  "NEW",
  "REPEAT",
] as const;

export const sellerCustomerListFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(100, "Search query is too long")
    .optional()
    .or(z.literal("")),
  relationship: z
    .enum(sellerCustomerRelationshipFilterOptions, {
      error: "Select a valid customer relationship filter",
    })
    .optional(),
  page: z.coerce
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .optional(),
});

export type SellerCustomerListFiltersInput = z.infer<
  typeof sellerCustomerListFiltersSchema
>;
