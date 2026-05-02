import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

function buildPrompt(transcript: string) {
  return `You are cleaning up a voice transcript so it's readable as a Google review.

Your ONLY jobs:
1. Add punctuation (periods, commas, question marks) where natural.
2. Capitalize the first letter of each sentence and proper nouns (restaurant name, city names).
3. Remove ONLY these specific filler words: "um", "uh", "erm", "mm".
4. Fix obvious speech-recognition errors where the recognizer clearly mis-heard a word.

DO NOT:
- Change any other words
- Fix grammar, even if it's wrong
- Remove words like "like", "you know", "so", "basically"
- Change or remove slang ("bussin", "fire", "no cap", "lowkey", etc.)
- Rewrite sentences to sound better
- Add words that weren't in the original
- Make the review sound more positive, polished, or professional

Return ONLY the cleaned text. No preamble, no quotes, no explanation.

Transcript: ${transcript}`;
}

type DemoGenerateBody = {
  transcript?: unknown;
  starRating?: unknown;
};

export async function POST(req: Request) {
  let body: DemoGenerateBody;
  try {
    body = (await req.json()) as DemoGenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const transcript =
    typeof body.transcript === "string" ? body.transcript.trim() : "";

  if (!transcript || transcript.length < 3) {
    return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let cleaned = transcript;

  if (apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const msg = await anthropic.messages.create({
        model: HAIKU_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: buildPrompt(transcript) }],
      });
      const first = msg.content[0];
      if (first && first.type === "text") {
        const text = first.text.trim();
        if (text.length > 0 && text.length <= transcript.length * 1.4) {
          cleaned = text;
        }
      }
    } catch {
      // graceful fallback
    }
  }

  return NextResponse.json({ review: cleaned });
}
