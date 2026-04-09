"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductImageField } from "@/components/shared/product-image-field";

type ProductDraft = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
};

const emptyProduct = (): ProductDraft => ({
  name: "",
  description: "",
  price: "",
  imageUrl: "",
});

export function OnboardingProductsForm() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductDraft[]>([emptyProduct()]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  function updateProduct(index: number, field: keyof ProductDraft, value: string) {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  }

  function addAnotherProduct() {
    setProducts((prev) => [...prev, emptyProduct()]);
  }

  function removeProduct(index: number) {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (uploadingCount > 0) {
      setError("Wait for image uploads to finish before saving products.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      products: products.map((product) => ({
        name: product.name,
        description: product.description,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        isActive: true,
      })),
    };

    const response = await fetch("/api/onboarding/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setError(result.message || "Unable to add products");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {products.map((product, index) => (
        <div key={index} className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Product {index + 1}</h2>
            {products.length > 1 ? (
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor={`name-${index}`}>Product Name</Label>
              <Input
                id={`name-${index}`}
                value={product.name}
                onChange={(e) => updateProduct(index, "name", e.target.value)}
                placeholder="2-piece set"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Input
                id={`description-${index}`}
                value={product.description}
                onChange={(e) => updateProduct(index, "description", e.target.value)}
                placeholder="Elegant outfit for casual outings"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor={`price-${index}`}>Price</Label>
              <Input
                id={`price-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={product.price}
                onChange={(e) => updateProduct(index, "price", e.target.value)}
                placeholder="25000"
                className="mt-1.5"
                required
              />
            </div>

            <ProductImageField
              value={product.imageUrl}
              onChange={(value) => updateProduct(index, "imageUrl", value)}
              onUploadStateChange={(isUploading) =>
                setUploadingCount((current) =>
                  isUploading ? current + 1 : Math.max(current - 1, 0)
                )
              }
              disabled={isSubmitting}
            />
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={addAnotherProduct}>
          Add Another Product
        </Button>

        <Button
          type="submit"
          className="sm:ml-auto"
          disabled={isSubmitting || uploadingCount > 0}
        >
          {isSubmitting
            ? "Saving Products..."
            : uploadingCount > 0
              ? "Uploading image..."
              : "Finish Setup"}
        </Button>
      </div>
    </form>
  );
}
