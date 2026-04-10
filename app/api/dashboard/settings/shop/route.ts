import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import {
  getSellerShopSettingsData,
  ShopServiceError,
  updateSellerShopSettings,
} from "@/lib/services/shop.service";
import { updateShopSchema } from "@/lib/validations/shop";

export async function GET(request: Request) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await getSellerShopSettingsData(user.id);

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(shop);
}

export async function PATCH(request: Request) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateShopSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid shop settings payload",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const shop = await updateSellerShopSettings(user.id, parsed.data);
    return NextResponse.json(shop);
  } catch (error) {
    if (error instanceof ShopServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to update shop settings right now" },
      { status: 500 }
    );
  }
}
