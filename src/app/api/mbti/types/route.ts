import { NextResponse } from "next/server";
import { getAllTypesFromGraph } from "@/services/mbti-graph-service";

export async function GET() {
  try {
    const result = await getAllTypesFromGraph();
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Failed to get MBTI types from graph:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
