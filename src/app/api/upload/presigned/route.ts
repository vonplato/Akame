import { NextRequest } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant";
import { createPresignedUploadUrl } from "@/lib/storage/r2-client";

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext();

    const contentType =
      req.nextUrl.searchParams.get("contentType") || "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return Response.json(
        { error: "Only image uploads are allowed" },
        { status: 400 }
      );
    }

    const result = await createPresignedUploadUrl(companyId, contentType);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ error: message }, { status: 401 });
  }
}
