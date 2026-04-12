"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AdminUserRoleToggleProps = {
  userId: string;
  userName: string;
  isAdmin: boolean;
};

export function AdminUserRoleToggle({
  userId,
  userName,
  isAdmin,
}: AdminUserRoleToggleProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleToggle() {
    const nextIsAdmin = !isAdmin;
    const confirmationMessage = nextIsAdmin
      ? `Grant admin access to ${userName}? They will be able to manage platform-wide settings and sellers.`
      : `Remove admin access from ${userName}? They will lose access to the internal admin area.`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isAdmin: nextIsAdmin,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          error?: string;
          fieldErrors?: {
            isAdmin?: string[];
          };
        }
      | null;

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(
        data?.fieldErrors?.isAdmin?.[0] ||
          data?.error ||
          "Unable to update admin access right now."
      );
      return;
    }

    setSuccessMessage(
      nextIsAdmin
        ? `${userName} can now access admin tools.`
        : `${userName} no longer has admin access.`
    );

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant={isAdmin ? "outline" : "default"}
        disabled={isSubmitting}
        onClick={handleToggle}
        className="w-full"
      >
        {isSubmitting
          ? isAdmin
            ? "Removing..."
            : "Promoting..."
          : isAdmin
            ? "Remove admin"
            : "Make admin"}
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
