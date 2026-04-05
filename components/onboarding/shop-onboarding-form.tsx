"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ShopOnboardingForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    whatsappNumber: "",
    instagramHandle: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/onboarding/shop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(result.message || "Unable to create shop");
      return;
    }

    router.push("/onboarding/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div>
        <Label htmlFor="name">Shop Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Amara Styles"
          className="mt-1.5"
          required
        />
      </div>

      <div>
        <Label htmlFor="slug">Shop URL Slug</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
          placeholder="amara-styles"
          className="mt-1.5"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Affordable fashion for confident women"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
        <Input
          id="whatsappNumber"
          value={form.whatsappNumber}
          onChange={(e) => updateField("whatsappNumber", e.target.value)}
          placeholder="+2348000000000"
          className="mt-1.5"
          required
        />
      </div>

      <div>
        <Label htmlFor="instagramHandle">Instagram Handle</Label>
        <Input
          id="instagramHandle"
          value={form.instagramHandle}
          onChange={(e) => updateField("instagramHandle", e.target.value)}
          placeholder="@amarastyles"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="bankName">Bank Name</Label>
        <Input
          id="bankName"
          value={form.bankName}
          onChange={(e) => updateField("bankName", e.target.value)}
          placeholder="Access Bank"
          className="mt-1.5"
          required
        />
      </div>

      <div>
        <Label htmlFor="bankAccountName">Account Name</Label>
        <Input
          id="bankAccountName"
          value={form.bankAccountName}
          onChange={(e) => updateField("bankAccountName", e.target.value)}
          placeholder="Amara Sanni"
          className="mt-1.5"
          required
        />
      </div>

      <div>
        <Label htmlFor="bankAccountNumber">Account Number</Label>
        <Input
          id="bankAccountNumber"
          value={form.bankAccountNumber}
          onChange={(e) => updateField("bankAccountNumber", e.target.value)}
          placeholder="0123456789"
          className="mt-1.5"
          required
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Creating Shop..." : "Continue"}
      </Button>
    </form>
  );
}