"use server";

import { redirect } from "next/navigation";
import {
  createStorefrontOrder,
  OrderServiceError,
} from "@/lib/services/order.service";
import { createStorefrontOrderSchema } from "@/lib/validations/order";

export type StorefrontCheckoutActionState = {
  message: string;
  errors: Partial<Record<string, string[]>>;
};

export async function submitStorefrontOrder(
  shopSlug: string,
  productId: string,
  _previousState: StorefrontCheckoutActionState,
  formData: FormData
) {
  const parsed = createStorefrontOrderSchema.safeParse({
    productId,
    quantity: formData.get("quantity"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    deliveryAddress: formData.get("deliveryAddress"),
    customerNote: formData.get("customerNote"),
  });

  if (!parsed.success) {
    return {
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  let order;

  try {
    order = await createStorefrontOrder({
      shopSlug,
      input: parsed.data,
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return {
        message: error.message,
        errors: {},
      };
    }

    console.error("Storefront checkout action error:", error);

    return {
      message: "Internal server error",
      errors: {},
    };
  }

  redirect(order.successPath);
}
