"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
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
import type { AccountSettingsFormValues } from "@/types/account";

type AccountSettingsField = keyof AccountSettingsFormValues;
type AccountSettingsFieldErrors = Partial<
  Record<AccountSettingsField, string[]>
>;

type AccountSettingsFormProps = {
  initialValues: AccountSettingsFormValues;
};

export function AccountSettingsForm({
  initialValues,
}: AccountSettingsFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AccountSettingsFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<AccountSettingsFieldErrors>(
    {}
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  function updateField(name: AccountSettingsField, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function getFieldError(name: AccountSettingsField) {
    return fieldErrors[name]?.[0];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/dashboard/settings/account", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = (await response.json().catch(() => null)) as
      | {
          error?: string;
          fieldErrors?: AccountSettingsFieldErrors;
        }
      | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setFieldErrors(result?.fieldErrors ?? {});
      setErrorMessage(result?.error || "Unable to update account settings");
      return;
    }

    setSuccessMessage("Account settings updated successfully.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit account settings</CardTitle>
        <CardDescription>
          Keep your seller profile current so your sign-in details and contact
          information stay accurate.
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
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Amara Sanni"
                className="mt-1.5"
                disabled={isSubmitting}
                aria-invalid={Boolean(getFieldError("fullName"))}
                required
              />
              {getFieldError("fullName") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("fullName")}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="seller@example.com"
                className="mt-1.5"
                disabled={isSubmitting}
                aria-invalid={Boolean(getFieldError("email"))}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This email remains your primary sign-in identity.
              </p>
              {getFieldError("email") ? (
                <p className="mt-1 text-xs text-red-600">
                  {getFieldError("email")}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+2348000000000"
              className="mt-1.5"
              disabled={isSubmitting}
              aria-invalid={Boolean(getFieldError("phone"))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Optional, but useful for keeping your seller record complete.
            </p>
            {getFieldError("phone") ? (
              <p className="mt-1 text-xs text-red-600">
                {getFieldError("phone")}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving account settings..." : "Save changes"}
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
              disabled={isSubmitting}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
