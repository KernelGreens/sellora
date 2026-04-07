import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSellerOrderListData } from "@/lib/services/order.service";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getSellerOrderListData(session.user.id);

  if (!data) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
