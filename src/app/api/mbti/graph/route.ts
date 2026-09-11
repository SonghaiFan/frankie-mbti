import { NextRequest, NextResponse } from "next/server";
import { getTypeGraphData, getGlobalGraphOverview } from "@/services/mbti-graph-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type) {
      const data = await getTypeGraphData(type);
      return NextResponse.json(data);
    }

    const overview = await getGlobalGraphOverview();
    return NextResponse.json(overview);
  } catch (err: unknown) {
    console.error("Failed to query graph data:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
