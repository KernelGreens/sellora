import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import { getSellerCustomerDetailData } from "@/lib/services/customer.service";

type RouteContext = {
  params: Promise<{
    customerId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId } = await context.params;
  const data = await getSellerCustomerDetailData(user.id, customerId);

  if (!data) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
