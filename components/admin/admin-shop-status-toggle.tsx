"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AdminShopStatusToggleProps = {
  shopId: string;
  shopName: string;
  isActive: boolean;
};

export function AdminShopStatusToggle({
  shopId,
  shopName,
  isActive,
}: AdminShopStatusToggleProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleToggle() {
    const nextIsActive = !isActive;
    const confirmationMessage = nextIsActive
      ? `Resume ${shopName}? Customers will be able to place new orders again.`
      : `Pause ${shopName}? Customers will no longer be able to place new orders until you resume it.`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/admin/shops/${shopId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: nextIsActive,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          error?: string;
          fieldErrors?: {
            isActive?: string[];
          };
        }
      | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(
        data?.fieldErrors?.isActive?.[0] ||
          data?.error ||
          "Unable to update storefront status right now."
      );
      return;
    }

    setSuccessMessage(
      nextIsActive
        ? `${shopName} is live again.`
        : `${shopName} is now paused.`
    );

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant={isActive ? "destructive" : "outline"}
        disabled={isSubmitting}
        onClick={handleToggle}
        className="w-full"
      >
        {isSubmitting
          ? isActive
            ? "Pausing..."
            : "Resuming..."
          : isActive
            ? "Pause shop"
            : "Resume shop"}
      </Button>

      {errorMessage ? (
        <p className="text-xs text-red-600">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="text-xs text-emerald-600">{successMessage}</p>
      ) : null}
    </div>
  );
}
