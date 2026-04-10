"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/generated/prisma/client";
import {
  getOrderStatusMeta,
  getAllowedOrderStatusTransitions,
} from "@/lib/constants/order-status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type OrderStatusUpdateFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusUpdateForm({
  orderId,
  currentStatus,
}: OrderStatusUpdateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const availableStatuses = getAllowedOrderStatusTransitions(currentStatus);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">(
    availableStatuses[0] ?? ""
  );
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStatus) {
      setErrorMessage("Select the next order status.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/dashboard/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: selectedStatus,
        note,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          error?: string;
          fieldErrors?: {
            status?: string[];
            note?: string[];
          };
        }
      | null;

    if (!response.ok) {
      setErrorMessage(
        data?.fieldErrors?.status?.[0] ||
          data?.fieldErrors?.note?.[0] ||
          data?.error ||
          "Unable to update order status right now."
      );
      return;
    }

    setSuccessMessage(
      `Order moved to ${getOrderStatusMeta(selectedStatus).label}.`
    );

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update status</CardTitle>
        <CardDescription>
          Move this order forward as payment or fulfillment changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Current status</p>
          <p className="text-sm text-muted-foreground">
            {getOrderStatusMeta(currentStatus).label}
          </p>
        </div>

        {availableStatuses.length === 0 ? (
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            This order is already in a final state and cannot be updated again here.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <Label htmlFor="status">Next status</Label>
              <NativeSelect
                id="status"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as OrderStatus)
                }
                className="mt-1.5 w-full"
                disabled={isPending}
              >
                {availableStatuses.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {getOrderStatusMeta(status).label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div>
              <Label htmlFor="note">Internal note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Paid via transfer, preparing dispatch for tomorrow."
                className="mt-1.5 min-h-24"
                disabled={isPending}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Updating status..." : "Save status update"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
