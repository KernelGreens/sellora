import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import { ShopServiceError, updateAdminShopStatus } from "@/lib/services/shop.service";
import { updateAdminShopStatusSchema } from "@/lib/validations/shop";

type RouteContext = {
  params: Promise<{
    shopId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateAdminShopStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid shop status payload",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { shopId } = await context.params;

  try {
    const shop = await updateAdminShopStatus(shopId, parsed.data);

    return NextResponse.json(shop);
  } catch (error) {
    if (error instanceof ShopServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to update shop status right now" },
      { status: 500 }
    );
  }
}
