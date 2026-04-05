import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
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

  imageUrl: z
    .string()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().optional().default(true),
});

export const createManyProductsSchema = z.object({
  products: z.array(createProductSchema).min(1, "Add at least one product"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;