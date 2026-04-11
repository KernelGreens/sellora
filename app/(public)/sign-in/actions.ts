"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type AuthLikeError = Error & {
  type?: string;
  code?: string;
  digest?: string;
};

function isRedirectError(error: unknown): error is { digest: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const rawCallbackUrl = formData.get("callbackUrl");
  const hasExplicitCallbackUrl =
    typeof rawCallbackUrl === "string" && rawCallbackUrl.length > 0;
  const callbackUrl = hasExplicitCallbackUrl ? rawCallbackUrl : "/dashboard";
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user =
      !hasExplicitCallbackUrl && normalizedEmail
        ? await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { isAdmin: true },
          })
        : null;

    await signIn("credentials", {
      email,
      password,
      redirectTo:
        !hasExplicitCallbackUrl && user?.isAdmin ? "/admin" : callbackUrl,
    });
  } catch (error: unknown) {
    if (isRedirectError(error)) {
      throw error;
    }

    const authError = error as AuthLikeError;

    if (authError?.type === "CredentialsSignin") {
      redirect(
        `/sign-in?error=${encodeURIComponent(
          "Invalid email or password"
        )}&callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    }

    redirect(
      `/sign-in?error=${encodeURIComponent(
        "Something went wrong. Please try again."
      )}&callbackUrl=${encodeURIComponent(callbackUrl)}`
    );
  }
}
