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
  const token = await getToken({
    req: {
      headers: headerList,
      cookies: Object.fromEntries(
        cookieStore.getAll().map((cookie) => [cookie.name, cookie.value])
      ),
    } as unknown as NextRequest,
    secret: getAuthSecret(),
  });

  return toAuthUser(token);
}

export async function getRequestAuthUser(request: Request) {
  const token = await getToken({
    req: request as NextRequest,
    secret: getAuthSecret(),
  });

  return toAuthUser(token);
}
