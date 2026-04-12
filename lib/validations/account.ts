import { z } from "zod";

export const updateAccountSettingsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255, "Email address is too long"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
});

export const updateAdminUserRoleSchema = z.object({
  isAdmin: z.boolean({
    error: "Select a valid admin access state",
  }),
});

export type UpdateAccountSettingsInput = z.infer<
  typeof updateAccountSettingsSchema
>;
export type UpdateAdminUserRoleInput = z.infer<typeof updateAdminUserRoleSchema>;
