"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

function normalizeClientRedirectUrl(url: string | null | undefined, fallback: string) {
  if (!url) {
    return fallback;
  }

  try {
    const resolvedUrl = new URL(url, window.location.origin);

    if (resolvedUrl.origin !== window.location.origin) {
      return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}` || fallback;
    }

    return resolvedUrl.toString();
  } catch {
    return fallback;
  }
}

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const result = await signOut({
          callbackUrl: "/sign-in",
          redirect: false,
        });

        window.location.assign(
          normalizeClientRedirectUrl(result.url, "/sign-in")
        );
      }}
    >
      Sign out
    </Button>
  );
}
