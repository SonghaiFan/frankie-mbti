import { NextResponse } from "next/server";
import { getSystemGraphStats } from "@/services/mbti-graph-service";

export async function GET() {
  try {
    const stats = await getSystemGraphStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    console.error("Failed to get system graph stats:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
