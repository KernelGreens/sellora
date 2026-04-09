"use client";

import { useId, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductImageFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
};

export function ProductImageField({
  value,
  onChange,
  onUploadStateChange,
  disabled = false,
  error,
  label = "Product image",
  helperText = "Upload from device or paste an image URL manually.",
}: ProductImageFieldProps) {
  const inputId = useId();
  const fileInputId = useId();
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setUploadError("");
    setIsUploading(true);
    onUploadStateChange?.(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploads/product-image", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => null)) as
        | {
            url?: string;
            error?: string;
          }
        | null;

      if (!response.ok || !result?.url) {
        setUploadError(result?.error || "Unable to upload image.");
        return;
      }

      onChange(result.url);
    } catch {
      setUploadError("Unable to upload image.");
    } finally {
      setIsUploading(false);
      onUploadStateChange?.(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={fileInputId}>{label}</Label>
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex-1 space-y-3">
            <Input
              id={fileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={disabled || isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                void handleFileChange(file);
                event.target.value = "";
              }}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || isUploading}
                onClick={() => {
                  const element = document.getElementById(fileInputId);

                  if (element instanceof HTMLInputElement) {
                    element.click();
                  }
                }}
              >
                <UploadCloud className="size-4" />
                {isUploading ? "Uploading..." : "Upload image"}
              </Button>

              {value ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled || isUploading}
                  onClick={() => onChange("")}
                >
                  <X className="size-4" />
                  Remove image
                </Button>
              ) : null}
            </div>
          </div>

          <div className="w-full md:max-w-[180px]">
            <div className="overflow-hidden rounded-xl border bg-background">
              {value ? (
                <div
                  className="aspect-square w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${value})` }}
                  aria-label="Product image preview"
                  role="img"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
                  Image preview will show here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor={inputId}>Or paste image URL</Label>
        <Input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://example.com/image.jpg"
          className="mt-1.5"
          disabled={disabled || isUploading}
          aria-invalid={Boolean(error)}
        />
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}
