"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitStorefrontOrder,
  type StorefrontCheckoutActionState,
} from "@/app/store/[slug]/checkout/actions";
import { formatNaira } from "@/lib/utils/currency";

type StorefrontCheckoutFormProps = {
  shopSlug: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
  initialQuantity: number;
};

const initialStorefrontCheckoutActionState: StorefrontCheckoutActionState = {
  message: "",
  errors: {},
};

export function StorefrontCheckoutForm({
  shopSlug,
  product,
  initialQuantity: quantity,
}: StorefrontCheckoutFormProps) {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    customerNote: "",
  });
  const submitOrderAction = submitStorefrontOrder.bind(
    null,
    shopSlug,
    product.id
  );
  const [state, formAction, isSubmitting] = useActionState(
    submitOrderAction,
    initialStorefrontCheckoutActionState
  );
  const totalAmount = useMemo(
    () => product.price * quantity,
    [product.price, quantity]
  );
  const decrementHref = `/store/${shopSlug}/checkout?productId=${product.id}&quantity=${Math.max(
    1,
    quantity - 1
  )}`;
  const incrementHref = `/store/${shopSlug}/checkout?productId=${product.id}&quantity=${quantity + 1}`;

  function updateField(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function getFieldError(name: keyof StorefrontCheckoutActionState["errors"]) {
    return state.errors[name]?.[0];
  }

  return (
    <form action={formAction} className="space-y-6 rounded-3xl border bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Complete your order</h2>
        <p className="text-sm text-muted-foreground">
          Your order will be saved first, then you can send it on WhatsApp for seller confirmation.
        </p>
      </div>

      {state.message ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-muted/20 p-4">
        <div className="flex items-start gap-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-20 w-20 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
              No image
            </div>
          )}

          <div className="flex-1">
            <p className="font-medium">{product.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Unit price: {formatNaira(product.price)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Link
              href={decrementHref}
              className="touch-manipulation rounded-lg border px-3 py-2 text-sm select-none"
              aria-label={`Decrease quantity for ${product.name}`}
            >
              -
            </Link>

            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={50}
              step={1}
              readOnly
              value={quantity}
              className="h-10 w-24 text-center"
              aria-invalid={Boolean(getFieldError("quantity"))}
            />

            <Link
              href={incrementHref}
              className="touch-manipulation rounded-lg border px-3 py-2 text-sm select-none"
              aria-label={`Increase quantity for ${product.name}`}
            >
              +
            </Link>
          </div>

          {getFieldError("quantity") ? (
            <p className="mt-1 text-xs text-red-600">{getFieldError("quantity")}</p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Order total</span>
          <span className="text-lg font-semibold">{formatNaira(totalAmount)}</span>
        </div>
      </div>

      <div>
        <Label htmlFor="customerName">Full name</Label>
        <Input
          id="customerName"
          name="customerName"
          value={form.customerName}
          onChange={(event) => updateField("customerName", event.target.value)}
          placeholder="Ada Okafor"
          className="mt-1.5 h-10"
          required
          aria-invalid={Boolean(getFieldError("customerName"))}
        />
        {getFieldError("customerName") ? (
          <p className="mt-1 text-xs text-red-600">{getFieldError("customerName")}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="customerPhone">WhatsApp number</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          value={form.customerPhone}
          onChange={(event) => updateField("customerPhone", event.target.value)}
          placeholder="08012345678"
          className="mt-1.5 h-10"
          required
          aria-invalid={Boolean(getFieldError("customerPhone"))}
        />
        {getFieldError("customerPhone") ? (
          <p className="mt-1 text-xs text-red-600">{getFieldError("customerPhone")}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="deliveryAddress">Delivery address or pickup preference</Label>
        <Textarea
          id="deliveryAddress"
          name="deliveryAddress"
          value={form.deliveryAddress}
          onChange={(event) => updateField("deliveryAddress", event.target.value)}
          placeholder="12 Admiralty Way, Lekki Phase 1, Lagos"
          className="mt-1.5 min-h-24"
          required
          aria-invalid={Boolean(getFieldError("deliveryAddress"))}
        />
        {getFieldError("deliveryAddress") ? (
          <p className="mt-1 text-xs text-red-600">{getFieldError("deliveryAddress")}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="customerEmail">Email (optional)</Label>
        <Input
          id="customerEmail"
          name="customerEmail"
          type="email"
          value={form.customerEmail}
          onChange={(event) => updateField("customerEmail", event.target.value)}
          placeholder="you@example.com"
          className="mt-1.5 h-10"
          aria-invalid={Boolean(getFieldError("customerEmail"))}
        />
        {getFieldError("customerEmail") ? (
          <p className="mt-1 text-xs text-red-600">{getFieldError("customerEmail")}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="customerNote">Extra note (optional)</Label>
        <Textarea
          id="customerNote"
          name="customerNote"
          value={form.customerNote}
          onChange={(event) => updateField("customerNote", event.target.value)}
          placeholder="Please send the black color if available."
          className="mt-1.5 min-h-20"
          aria-invalid={Boolean(getFieldError("customerNote"))}
        />
        {getFieldError("customerNote") ? (
          <p className="mt-1 text-xs text-red-600">{getFieldError("customerNote")}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving your order..." : "Save order and continue"}
      </Button>
    </form>
  );
}
