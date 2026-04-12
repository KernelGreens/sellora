import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import {
  AccountServiceError,
  updateAdminUserRole,
} from "@/lib/services/account.service";
import { updateAdminUserRoleSchema } from "@/lib/validations/account";

type RouteContext = {
  params: Promise<{
    userId: string;
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
  const parsed = updateAdminUserRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid admin role payload",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { userId } = await context.params;

  try {
    const updatedUser = await updateAdminUserRole(user.id, userId, parsed.data);

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof AccountServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to update admin access right now" },
      { status: 500 }
    );
  }
}
