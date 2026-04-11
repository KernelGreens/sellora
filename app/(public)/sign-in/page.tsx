"use client";

import Link from "next/link";
import { FormEvent, use, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
    success?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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

export default function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = use(searchParams);
  const requestedCallbackUrl = getSearchParamValue(resolvedSearchParams.callbackUrl);
  const callbackUrl = requestedCallbackUrl || "/dashboard";
  const hasExplicitCallbackUrl = Boolean(requestedCallbackUrl);
  const errorParam = getSearchParamValue(resolvedSearchParams.error);
  const successParam = getSearchParamValue(resolvedSearchParams.success);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result) {
      setFormError("Something went wrong. Please try again.");
      return;
    }

    if (result.error) {
      setFormError("Invalid email or password");
      return;
    }

    const session = await getSession();
    const targetUrl =
      !hasExplicitCallbackUrl && session?.user?.isAdmin
        ? "/admin"
        : normalizeClientRedirectUrl(result.url, callbackUrl);

    window.location.assign(targetUrl);
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-primary p-12 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-foreground">
          Sellora
        </Link>

        <div>
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Welcome back
          </h2>
          <p className="text-lg leading-relaxed text-primary-foreground/80">
            Your orders, customers, and insights are waiting. Pick up right where you left off.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Sellora
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="text-2xl font-bold text-primary">
              Sellora
            </Link>
          </div>

          <h1 className="mb-2 text-2xl font-bold">Sign in to Sellora</h1>
          <p className="mb-8 text-muted-foreground">
            Enter your credentials to access your dashboard.
          </p>

          {successParam ? (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successParam}
            </div>
          ) : null}

          {errorParam ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorParam}
            </div>
          ) : null}

          {formError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                placeholder="amara@example.com"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
