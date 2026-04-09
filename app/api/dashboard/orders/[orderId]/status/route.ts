import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import { OrderServiceError, updateSellerOrderStatus } from "@/lib/services/order.service";
import { updateSellerOrderStatusSchema } from "@/lib/validations/order";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSellerOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid status update payload",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { orderId } = await context.params;

  try {
    const updatedOrder = await updateSellerOrderStatus(
      user.id,
      orderId,
      parsed.data
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to update order status right now" },
      { status: 500 }
    );
  }
}
