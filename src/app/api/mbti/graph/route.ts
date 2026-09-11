import { NextRequest, NextResponse } from "next/server";
import {
  getTypeGraphData,
  getGlobalGraphOverview,
  getTypeRelations,
  getAllGroups,
  getCognitiveFunctionsOverview,
} from "@/services/mbti-graph-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const mode = searchParams.get("mode");

    if (mode === "relations" && type) {
      const relations = await getTypeRelations(type);
      if (!relations) {
        return NextResponse.json({ error: "Type not found" }, { status: 404 });
      }
      return NextResponse.json(relations);
    }

    if (mode === "groups") {
      const groups = await getAllGroups();
      return NextResponse.json({ data: groups, total: groups.length });
    }

    if (mode === "functions") {
      const functions = await getCognitiveFunctionsOverview();
      return NextResponse.json({ data: functions, total: functions.length });
    }

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
