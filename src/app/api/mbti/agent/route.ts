import { NextRequest, NextResponse } from "next/server";
import { runMbtiAgentChat, testGeminiConnection } from "@/services/mbti-agent-service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey") || req.headers.get("x-gemini-api-key") || undefined;
  const model = searchParams.get("model") || req.headers.get("x-gemini-model") || undefined;

  const result = await testGeminiConnection(apiKey, model);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mode = "diagnose", apiKey, model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Get optional key and model from header as well
    const headerKey = req.headers.get("x-gemini-api-key") || undefined;
    const headerModel = req.headers.get("x-gemini-model") || undefined;
    const effectiveKey = apiKey || headerKey;
    const effectiveModel = model || headerModel;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const event of runMbtiAgentChat({
            messages,
            mode,
            apiKey: effectiveKey,
            model: effectiveModel,
          })) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "流式输出中断";
          console.error("Agent Stream Error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message,
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.error("API /api/mbti/agent error:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
