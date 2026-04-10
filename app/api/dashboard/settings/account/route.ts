import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import {
  AccountServiceError,
  getSellerAccountSettingsData,
  updateSellerAccountSettings,
} from "@/lib/services/account.service";
import { updateAccountSettingsSchema } from "@/lib/validations/account";

export async function GET(request: Request) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await getSellerAccountSettingsData(user.id);

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(account);
}

export async function PATCH(request: Request) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAccountSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid account settings payload",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const account = await updateSellerAccountSettings(user.id, parsed.data);
    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof AccountServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to update account settings right now" },
      { status: 500 }
    );
  }
}
