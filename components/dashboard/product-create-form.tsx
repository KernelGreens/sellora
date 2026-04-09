"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ProductImageField } from "@/components/shared/product-image-field";
import type { ProductFormValues } from "@/types/product";

type ProductCreateField = keyof ProductFormValues;

type ProductCreateFieldErrors = Partial<Record<ProductCreateField, string[]>>;

const initialFormState: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  imageUrl: "",
  isActive: true,
};

type ProductEditorFormProps = {
  method: "POST" | "PATCH";
  submitUrl: string;
  initialValues: ProductFormValues;
  submitLabel: string;
  submittingLabel: string;
  cancelHref: string;
  cardTitle: string;
  cardDescription: string;
};

function ProductEditorForm({
  method,
  submitUrl,
  initialValues,
  submitLabel,
  submittingLabel,
  cancelHref,
  cardTitle,
  cardDescription,
}: ProductEditorFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ProductCreateFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  function updateField(name: ProductCreateField, value: string | boolean) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function getFieldError(name: ProductCreateField) {
    return fieldErrors[name]?.[0];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    if (isImageUploading) {
      setErrorMessage("Wait for the image upload to finish before saving.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(submitUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stockQuantity:
          form.stockQuantity.trim() === ""
            ? null
            : Number(form.stockQuantity),
        imageUrl: form.imageUrl,
        isActive: form.isActive,
      }),
    });

    const result = (await response.json().catch(() => null)) as
      | {
          error?: string;
          fieldErrors?: ProductCreateFieldErrors;
        }
      | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setFieldErrors(result?.fieldErrors ?? {});
      setErrorMessage(result?.error || "Unable to create product");
      return;
    }

    router.push("/dashboard/products");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div>
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="2-piece set"
              className="mt-1.5"
              disabled={isSubmitting || isImageUploading}
              aria-invalid={Boolean(getFieldError("name"))}
              required
            />
            {getFieldError("name") ? (
              <p className="mt-1 text-xs text-red-600">{getFieldError("name")}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Elegant outfit for casual outings"
              className="mt-1.5 min-h-28"
              disabled={isSubmitting || isImageUploading}
              aria-invalid={Boolean(getFieldError("description"))}
            />
            {getFieldError("description") ? (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("description")}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="25000"
                className="mt-1.5"
                disabled={isSubmitting || isImageUploading}
                aria-invalid={Boolean(getFieldError("price"))}
                required
              />
              {getFieldError("price") ? (
                <p className="mt-1 text-xs text-red-600">{getFieldError("price")}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="stockQuantity">Stock quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={(event) =>
                  updateField("stockQuantity", event.target.value)
                }
                placeholder="Leave blank to skip tracking"
                className="mt-1.5"
                disabled={isSubmitting || isImageUploading}
                aria-invalid={Boolean(getFieldError("stockQuantity"))}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank if you do not want stock alerts yet.
              </p>
              {getFieldError("stockQuantity") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("stockQuantity")}
                </p>
              ) : null}
            </div>
          </div>

          <ProductImageField
            value={form.imageUrl}
            onChange={(value) => updateField("imageUrl", value)}
            onUploadStateChange={setIsImageUploading}
            disabled={isSubmitting || isImageUploading}
            error={getFieldError("imageUrl")}
          />

          <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/20 p-4">
            <div className="space-y-1">
              <Label htmlFor="isActive">Show on storefront</Label>
              <p className="text-sm text-muted-foreground">
                Turn this on to make the product visible to customers immediately.
              </p>
            </div>

            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) => updateField("isActive", checked)}
              disabled={isSubmitting || isImageUploading}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isSubmitting || isImageUploading}>
              {isSubmitting
                ? submittingLabel
                : isImageUploading
                  ? "Uploading image..."
                  : submitLabel}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(cancelHref)}
              disabled={isSubmitting || isImageUploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ProductCreateForm() {
  return (
    <ProductEditorForm
      method="POST"
      submitUrl="/api/dashboard/products"
      initialValues={initialFormState}
      submitLabel="Create product"
      submittingLabel="Creating product..."
      cancelHref="/dashboard/products"
      cardTitle="Add a new product"
      cardDescription="Create a new storefront listing with pricing, optional stock tracking, and visibility control."
    />
  );
}

type ProductEditFormProps = {
  productId: string;
  initialValues: ProductFormValues;
};

export function ProductEditForm({
  productId,
  initialValues,
}: ProductEditFormProps) {
  return (
    <ProductEditorForm
      method="PATCH"
      submitUrl={`/api/dashboard/products/${productId}`}
      initialValues={initialValues}
      submitLabel="Save changes"
      submittingLabel="Saving changes..."
      cancelHref="/dashboard/products"
      cardTitle="Edit product details"
      cardDescription="Update pricing, image, stock tracking, and storefront visibility for this listing."
    />
  );
}
