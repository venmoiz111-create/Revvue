import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

// Prompt is intentionally minimal. Google flags over-polished reviews as AI-
// generated spam — we need the output to read like a real person typed it on
// their phone: fillers intact, grammar imperfect, only punctuation added.
function buildPrompt(businessName: string, transcript: string) {
  return `You are cleaning up a voice transcript so it's readable as a Google review.

Your ONLY jobs:
1. Add punctuation (periods, commas, question marks) where natural.
2. Capitalize the first letter of each sentence and proper nouns (restaurant name, city names).
3. Remove ONLY these specific filler words: "um", "uh", "erm", "mm".
4. Fix obvious speech-recognition errors where the recognizer clearly mis-heard a word the customer was saying. Examples: "there" vs "their" (homophones), "im a" → "I'd" (misheard contraction), "should of" → "should've", "gunna" → "gonna", "wanna eat" stays as-is. Only fix when the customer's intent is unambiguous. If in any doubt, leave it.

DO NOT:
- Change any other words
- Fix grammar, even if it's wrong (keep "me and my friend was there", "we was here", "it were nice" — these are how people speak)
- Remove words like "like", "you know", "so", "basically", "actually", "honestly" — these are how people talk
- Change, "correct", or remove slang or modern speech ("bussin", "fire", "no cap", "lowkey", "fr", "mid", "slaps", "vibes", "yo", "dope", etc.) — leave it exactly as the customer said it
- Rewrite sentences to sound better
- Combine or split sentences
- Add any words that weren't in the original
- Make the review sound more positive, more negative, more polished, or more professional
- Add greetings, sign-offs, or restaurant names that weren't mentioned

The goal: the cleaned review should read EXACTLY like the customer's own voice, just with basic punctuation so it's not a wall of text. It should look like a real person typed it quickly on their phone — imperfect, casual, authentic.

If the transcript is too short (under 10 words) or unclear, return it unchanged.

Return ONLY the cleaned text. No preamble, no quotes, no explanation.

Business: ${businessName}
Transcript: ${transcript}`;
}

type GenerateBody = {
  transcript?: unknown;
  businessName?: unknown;
  clientId?: unknown;
  starRating?: unknown;
};

export async function POST(req: Request) {
  const startedAt = Date.now();

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
  const businessName =
    typeof body.businessName === "string" && body.businessName.trim().length > 0
      ? body.businessName.trim()
      : "the restaurant";
  const clientId = typeof body.clientId === "string" ? body.clientId : null;
  const starRating =
    typeof body.starRating === "number" &&
    body.starRating >= 1 &&
    body.starRating <= 5
      ? Math.round(body.starRating)
      : null;

  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
  }
  if (!transcript) {
    return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
  }

  // Too short to bother cleaning up — pass straight through, still log it.
  if (transcript.length < 10) {
    const reviewId = await logReview({
      clientId,
      rawTranscript: transcript,
      cleanedReview: transcript,
      starRating,
      userAgent: req.headers.get("user-agent"),
      processingMs: Date.now() - startedAt,
    });
    return NextResponse.json({ review: transcript, reviewId });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  let cleaned = transcript;

  if (!apiKey) {
    // No Haiku key configured — fall back to raw transcript rather than breaking
    // the customer flow. A real customer standing at a table will not retry.
    console.warn("ANTHROPIC_API_KEY missing; returning raw transcript.");
  } else {
    try {
      const anthropic = new Anthropic({ apiKey });
      const msg = await anthropic.messages.create({
        model: HAIKU_MODEL,
        // Reviews should be same length as the transcript, never longer. 300
        // tokens is ample for a 10s spoken review and prevents over-expansion.
        max_tokens: 300,
        messages: [
          { role: "user", content: buildPrompt(businessName, transcript) },
        ],
      });

      const first = msg.content[0];
      if (first && first.type === "text") {
        const text = first.text.trim();
        if (text.length > 0) {
          // If Haiku expanded text significantly, it probably hallucinated or
          // elaborated. Fall back to raw to preserve authenticity.
          if (text.length > transcript.length * 1.4) {
            console.warn("Haiku expanded text too much, falling back to raw", {
              rawLen: transcript.length,
              cleanedLen: text.length,
            });
            cleaned = transcript;
          } else {
            cleaned = text;
          }
        }
      }
    } catch (err) {
      console.error("Haiku cleanup failed:", err);
      // graceful fallback: use the raw transcript
      cleaned = transcript;
    }
  }

  const reviewId = await logReview({
    clientId,
    rawTranscript: transcript,
    cleanedReview: cleaned,
    starRating,
    userAgent: req.headers.get("user-agent"),
    processingMs: Date.now() - startedAt,
  });

  return NextResponse.json({ review: cleaned, reviewId });
}

async function logReview(params: {
  clientId: string;
  rawTranscript: string;
  cleanedReview: string;
  starRating: number | null;
  userAgent: string | null;
  processingMs: number;
}): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        client_id: params.clientId,
        raw_transcript: params.rawTranscript,
        cleaned_review: params.cleanedReview,
        char_count: params.cleanedReview.length,
        star_rating: params.starRating,
        user_agent: params.userAgent,
        processing_ms: params.processingMs,
      })
      .select("review_id")
      .single();

    if (error) {
      console.error("Supabase insert failed:", error);
      return null;
    }
    return (data?.review_id as string) ?? null;
  } catch (err) {
    console.error("Supabase insert threw:", err);
    return null;
  }
}
