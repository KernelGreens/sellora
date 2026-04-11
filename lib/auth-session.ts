import { cookies, headers } from "next/headers";
import type { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
};

function getAuthSecret() {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
}

const SESSION_COOKIE_NAMES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
] as const;

type CookieStoreLike = {
  getAll(): Array<{ name: string; value: string }>;
};

function parseCookieHeader(cookieHeader: string | null) {
  const parsedCookies: Record<string, string> = {};

  if (!cookieHeader) {
    return parsedCookies;
  }

  for (const entry of cookieHeader.split(/;\s*/)) {
    const separatorIndex = entry.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = entry.slice(0, separatorIndex);
    const value = entry.slice(separatorIndex + 1);
    parsedCookies[name] = value;
  }

  return parsedCookies;
}

function getCookieSource(headersList: Headers, cookieStore?: CookieStoreLike) {
  if (cookieStore && typeof cookieStore.getAll === "function") {
    return cookieStore;
  }

  return parseCookieHeader(headersList.get("cookie"));
}

async function getAuthTokenForRequest({
  headers: requestHeaders,
  cookies: requestCookies,
}: {
  headers: Headers;
  cookies?: CookieStoreLike;
}) {
  const secret = getAuthSecret();

  if (!secret) {
    return null;
  }

  const req = {
    headers: requestHeaders,
    cookies: getCookieSource(requestHeaders, requestCookies),
  } as unknown as NextRequest;

  for (const cookieName of SESSION_COOKIE_NAMES) {
    const token = await getToken({
      req,
      secret,
      cookieName,
    });

    if (token) {
      return token;
    }
  }

  return null;
}

function toAuthUser(token: JWT | null): AuthUser | null {
  if (!token?.id || typeof token.id !== "string") {
    return null;
  }

  return {
    id: token.id,
    email: typeof token.email === "string" ? token.email : null,
    name: typeof token.name === "string" ? token.name : null,
  };
}

export async function getServerAuthUser() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const token = await getAuthTokenForRequest({
    headers: headerList,
    cookies: cookieStore,
  });

  return toAuthUser(token);
}

export async function getRequestAuthUser(request: Request) {
  const nextRequest = request as NextRequest;
  const requestCookies =
    typeof nextRequest.cookies?.getAll === "function"
      ? nextRequest.cookies
      : undefined;
  const token = await getAuthTokenForRequest({
    headers: request.headers,
    cookies: requestCookies,
  });

  return toAuthUser(token);
}
