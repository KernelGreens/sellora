import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import { StorageError, uploadProductImage } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const fileEntry = formData?.get("file");

  if (!(fileEntry instanceof File)) {
    return NextResponse.json(
      { error: "Choose an image file to upload." },
      { status: 400 }
    );
  }

  try {
    const upload = await uploadProductImage(fileEntry);

    return NextResponse.json({
      url: upload.url,
      key: upload.key,
      provider: upload.provider,
    });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to upload image right now." },
      { status: 500 }
    );
  }
}
