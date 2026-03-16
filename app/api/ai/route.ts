import { NextRequest, NextResponse } from "next/server";
import {
  summarizeContent,
  improveContent,
  generateTags,
} from "@/lib/groq";
import { aiRequestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { action, content, title } = parsed.data;
    let result;

    switch (action) {
      case "summarize":
        result = await summarizeContent(content);
        break;

      case "improve":
        result = await improveContent(content);
        break;

      case "tags":
        result = await generateTags(content, title);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid AI action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown AI error",
      },
      { status: 500 }
    );
  }
}