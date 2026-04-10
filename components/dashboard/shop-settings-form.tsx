"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImageField } from "@/components/shared/product-image-field";
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
import type { ShopSettingsFormValues } from "@/types/shop";

type ShopSettingsField = keyof ShopSettingsFormValues;
type ShopSettingsFieldErrors = Partial<Record<ShopSettingsField, string[]>>;

type ShopSettingsFormProps = {
  initialValues: ShopSettingsFormValues;
};

export function ShopSettingsForm({ initialValues }: ShopSettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ShopSettingsFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ShopSettingsFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  function updateField(name: ShopSettingsField, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function getFieldError(name: ShopSettingsField) {
    return fieldErrors[name]?.[0];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    if (isImageUploading) {
      setErrorMessage("Wait for the logo upload to finish before saving.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/dashboard/settings/shop", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = (await response.json().catch(() => null)) as
      | {
          error?: string;
          fieldErrors?: ShopSettingsFieldErrors;
        }
      | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setFieldErrors(result?.fieldErrors ?? {});
      setErrorMessage(result?.error || "Unable to update shop settings");
      return;
    }

    setSuccessMessage("Shop settings updated successfully.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit shop settings</CardTitle>
        <CardDescription>
          Update your storefront identity, contact channels, payout details, and
          visibility from one place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Shop name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Amara Styles"
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
              <Label htmlFor="slug">Shop URL slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(event) => updateField("slug", event.target.value)}
                placeholder="amara-styles"
                className="mt-1.5"
                disabled={isSubmitting || isImageUploading}
                aria-invalid={Boolean(getFieldError("slug"))}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Use lowercase letters, numbers, and hyphens only.
              </p>
              {getFieldError("slug") ? (
                <p className="mt-1 text-xs text-red-600">{getFieldError("slug")}</p>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Shop description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Affordable fashion for confident women"
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

          <ProductImageField
            value={form.logoUrl}
            onChange={(value) => updateField("logoUrl", value)}
            onUploadStateChange={setIsImageUploading}
            disabled={isSubmitting || isImageUploading}
            error={getFieldError("logoUrl")}
            label="Shop logo"
            helperText="Upload a logo from device or paste the logo URL manually."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="whatsappNumber">WhatsApp number</Label>
              <Input
                id="whatsappNumber"
                value={form.whatsappNumber}
                onChange={(event) =>
                  updateField("whatsappNumber", event.target.value)
                }
                placeholder="+2348000000000"
                className="mt-1.5"
                disabled={isSubmitting || isImageUploading}
                aria-invalid={Boolean(getFieldError("whatsappNumber"))}
                required
              />
              {getFieldError("whatsappNumber") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("whatsappNumber")}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="instagramHandle">Instagram handle</Label>
              <Input
                id="instagramHandle"
                value={form.instagramHandle}
                onChange={(event) =>
                  updateField("instagramHandle", event.target.value)
                }
                placeholder="@amarastyles"
                className="mt-1.5"
                disabled={isSubmitting || isImageUploading}
                aria-invalid={Boolean(getFieldError("instagramHandle"))}
              />
              {getFieldError("instagramHandle") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("instagramHandle")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="bankName">Bank name</Label>
              <Input
                id="bankName"
                value={form.bankName}
                onChange={(event) => updateField("bankName", event.target.value)}
                placeholder="Access Bank"
                className="mt-1.5"
                disabled={isSubmitting || isImageUploading}
                aria-invalid={Boolean(getFieldError("bankName"))}
                required
              />
              {getFieldError("bankName") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("bankName")}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="bankAccountName">Account name</Label>
              <Input
                id="bankAccountName"
                value={form.bankAccountName}
                onChange={(event) =>
                  updateField("bankAccountName", event.target.value)
                }
                placeholder="Amara Sanni"
                className="mt-1.5"
                disabled={isSubmitting || isImageUploading}
                aria-invalid={Boolean(getFieldError("bankAccountName"))}
                required
              />
              {getFieldError("bankAccountName") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("bankAccountName")}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="bankAccountNumber">Account number</Label>
              <Input
                id="bankAccountNumber"
                value={form.bankAccountNumber}
                onChange={(event) =>
                  updateField("bankAccountNumber", event.target.value)
                }
                placeholder="0123456789"
                className="mt-1.5"
                disabled={isSubmitting || isImageUploading}
                aria-invalid={Boolean(getFieldError("bankAccountNumber"))}
                required
              />
              {getFieldError("bankAccountNumber") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("bankAccountNumber")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/20 p-4">
            <div className="space-y-1">
              <Label htmlFor="isActive">Storefront active</Label>
              <p className="text-sm text-muted-foreground">
                Turn this off if you want to pause your storefront without
                deleting products or customer records.
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
                ? "Saving shop settings..."
                : isImageUploading
                  ? "Uploading logo..."
                  : "Save changes"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(initialValues);
                setFieldErrors({});
                setErrorMessage("");
                setSuccessMessage("");
              }}
              disabled={isSubmitting || isImageUploading}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
