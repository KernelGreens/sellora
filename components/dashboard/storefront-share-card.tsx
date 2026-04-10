"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, MessageCircle, Share2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

type StorefrontShareCardProps = {
  shopName: string;
  storefrontPath: string;
  description: string | null;
  isActive: boolean;
};

type FeedbackState = {
  tone: "success" | "info" | "error";
  message: string;
} | null;

function buildShareMessage({
  shopName,
  description,
  storefrontUrl,
}: {
  shopName: string;
  description: string | null;
  storefrontUrl: string;
}) {
  const trimmedDescription = description?.trim();
  const pitch = trimmedDescription
    ? trimmedDescription
    : `Discover ${shopName} and order quickly through a simple WhatsApp-first storefront.`;

  return `Shop ${shopName} on Sellora.\n${pitch}\nBrowse and order here: ${storefrontUrl}`;
}

function copyWithFallback(value: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const didCopy = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!didCopy) {
    throw new Error("Copy failed");
  }
}

export function StorefrontShareCard({
  shopName,
  storefrontPath,
  description,
  isActive,
}: StorefrontShareCardProps) {
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const storefrontUrl = useMemo(
    () => (origin ? new URL(storefrontPath, origin).toString() : storefrontPath),
    [origin, storefrontPath]
  );
  const shareMessage = useMemo(
    () =>
      buildShareMessage({
        shopName,
        description,
        storefrontUrl,
      }),
    [description, shopName, storefrontUrl]
  );
  const whatsappShareUrl = useMemo(
    () => `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
    [shareMessage]
  );

  function getLiveSharePayload() {
    const liveStorefrontUrl = new URL(
      storefrontPath,
      window.location.origin
    ).toString();
    const liveShareMessage = buildShareMessage({
      shopName,
      description,
      storefrontUrl: liveStorefrontUrl,
    });

    return {
      storefrontUrl: liveStorefrontUrl,
      shareMessage: liveShareMessage,
      whatsappShareUrl: `https://wa.me/?text=${encodeURIComponent(liveShareMessage)}`,
    };
  }

  async function handleNativeShare() {
    if (!isActive) {
      setFeedback({
        tone: "info",
        message: "Resume the storefront before sharing it with customers.",
      });
      return;
    }

    if (!navigator.share) {
      setFeedback({
        tone: "info",
        message:
          "Native sharing is not available here. Use WhatsApp share or copy the message instead.",
      });
      return;
    }

    const payload = getLiveSharePayload();

    try {
      await navigator.share({
        title: `Shop ${shopName} on Sellora`,
        text: payload.shareMessage,
        url: payload.storefrontUrl,
      });

      setFeedback({
        tone: "success",
        message: "Storefront ready to share. Send it to customers on any channel you like.",
      });
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") {
        return;
      }

      setFeedback({
        tone: "error",
        message: "We could not open the share sheet. Try WhatsApp share or copy instead.",
      });
    }
  }

  async function handleCopyMessage() {
    if (!isActive) {
      setFeedback({
        tone: "info",
        message: "Resume the storefront before copying a message for customers.",
      });
      return;
    }

    const payload = getLiveSharePayload();

    try {
      await copyWithFallback(payload.shareMessage);
      setFeedback({
        tone: "success",
        message: "Storefront message copied. Paste it into WhatsApp, Instagram, SMS, or anywhere else.",
      });
    } catch {
      setFeedback({
        tone: "error",
        message: "We could not copy the message automatically on this device.",
      });
    }
  }

  function handleWhatsAppShare() {
    if (!isActive) {
      setFeedback({
        tone: "info",
        message: "Resume the storefront before sharing it with customers.",
      });
      return;
    }

    const payload = getLiveSharePayload();
    window.open(payload.whatsappShareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Card className="border-primary/15 bg-linear-to-br from-primary/6 via-white to-white">
      <CardContent className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }
          >
            {isActive ? "Ready to share" : "Storefront paused"}
          </Badge>
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
            Storefront link
          </Badge>
        </div>

        {feedback ? (
          <Alert
            className={
              feedback.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : feedback.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-sky-200 bg-sky-50 text-sky-700"
            }
          >
            <AlertTitle>
              {feedback.tone === "success"
                ? "Ready"
                : feedback.tone === "error"
                  ? "Something went wrong"
                  : "Heads up"}
            </AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="rounded-2xl border bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Public path
          </p>
          <p className="mt-2 break-all text-sm font-medium text-foreground">
            {storefrontUrl}
          </p>
        </div>

        <div className="rounded-2xl border bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Share preview
          </p>
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground">
            {shareMessage}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            onClick={handleNativeShare}
            disabled={!isActive}
            className="sm:min-w-40"
          >
            <Share2 className="size-4" />
            Share store
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCopyMessage}
            disabled={!isActive}
            className="sm:min-w-40"
          >
            <Copy className="size-4" />
            Copy message
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleWhatsAppShare}
            disabled={!isActive}
            className="sm:min-w-40"
          >
            <MessageCircle className="size-4" />
            Share on WhatsApp
          </Button>

          <Button asChild variant="ghost" className="sm:min-w-40">
            <Link href={storefrontPath}>
              <ExternalLink className="size-4" />
              View storefront
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
