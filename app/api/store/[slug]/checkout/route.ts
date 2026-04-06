import { NextResponse } from "next/server";
import {
  createStorefrontOrder,
  OrderServiceError,
} from "@/lib/services/order.service";
import { createStorefrontOrderSchema } from "@/lib/validations/order";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = createStorefrontOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const order = await createStorefrontOrder({
      shopSlug: slug,
      input: parsed.data,
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        ...order,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Storefront checkout error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
