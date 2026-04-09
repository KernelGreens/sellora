import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import { getSellerOrderListData } from "@/lib/services/order.service";

export async function GET(request: Request) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getSellerOrderListData(user.id);

  if (!data) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
