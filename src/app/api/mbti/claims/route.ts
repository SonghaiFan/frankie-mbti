import { NextRequest, NextResponse } from "next/server";
import { getClaimsForType } from "@/services/claims-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const result = await getClaimsForType({
      type,
      context: searchParams.get("context") ?? undefined,
      kind: searchParams.get("kind") ?? undefined,
      function: searchParams.get("function") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      limit: limitParam === null ? undefined : Number(limitParam),
      offset: offsetParam === null ? undefined : Number(offsetParam),
    });
    if (!result) {
      return NextResponse.json({ error: "Type not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Failed to query claims:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
