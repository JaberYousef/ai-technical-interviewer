import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "alloy" } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // For now, we'll use local TTS instead of cloud TTS
    // OpenRouter doesn't support TTS directly
    return NextResponse.json(
      { 
        error: "Cloud TTS not available, using local TTS instead",
        fallback: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
