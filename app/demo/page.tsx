"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const STAR_LABELS = ["Terrible", "Poor", "OK", "Good", "Amazing"];
const MIN_CHARS = 5;

type Stage =
  | "stars"
  | "recording"
  | "processing"
  | "ready"
  | "done"
  | "error"
  | "no-speech";

export default function DemoPage() {
  const [stage, setStage] = useState<Stage>("stars");
  const [starRating, setStarRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [interim, setInterim] = useState("");
  const [cleanedReview, setCleanedReview] = useState("");
  const [editedReview, setEditedReview] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState<boolean | null>(null);

  const finalRef = useRef("");
  const recRef = useRef<any>(null);
  const holdingRef = useRef(false);

  useEffect(() => {
    const SR =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;
    setSupportsSpeech(!!SR);
  }, []);

  const startRecording = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) { setSupportsSpeech(false); return; }

    finalRef.current = "";
    setInterim("");
    setErrorMsg("");

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (ev: any) => {
      let interimStr = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        const chunk = r[0]?.transcript ?? "";
        if (r.isFinal) finalRef.current = (finalRef.current + " " + chunk).trim();
        else interimStr += chunk;
      }
      setInterim(interimStr);
    };

    rec.onerror = (ev: any) => {
      const code: string = ev?.error ?? "unknown";
      if (code === "no-speech" || code === "aborted") return;
      holdingRef.current = false;
      try { rec.stop(); } catch { /* noop */ }
      if (code === "not-allowed" || code === "permission-denied") {
        setErrorMsg("Microphone permission denied. Tap the lock icon in your browser bar and allow the mic.");
      } else {
        setErrorMsg("Couldn't access mic. Try again.");
      }
      setStage("error");
    };

    rec.onend = () => {
      if (holdingRef.current) {
        try { rec.start(); } catch { /* already started */ }
      }
    };

    try {
      rec.start();
      recRef.current = rec;
      holdingRef.current = true;
      setStage("recording");
    } catch {
      setErrorMsg("Couldn't start recording. Try again.");
      setStage("error");
    }
  }, []);

  const stopAndProcess = useCallback(async () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    try { recRef.current?.stop(); } catch { /* noop */ }
    recRef.current = null;

    await new Promise((r) => setTimeout(r, 150));
    const transcript = (finalRef.current || interim).trim();
    setInterim("");

    if (transcript.length < MIN_CHARS) {
      setErrorMsg("We didn't catch that. Hold a little longer and speak clearly.");
      setStage("error");
      return;
    }

    setStage("processing");
    try {
      const res = await fetch("/api/demo/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript, starRating }),
      });
      const data = await res.json() as { review?: string; error?: string };
      if (!res.ok || !data.review) throw new Error(data.error ?? "Generation failed");
      setCleanedReview(data.review);
      setEditedReview(data.review);
      setStage("ready");
    } catch {
      setErrorMsg("Something went wrong generating your review. Try again.");
      setStage("error");
    }
  }, [interim, starRating]);

  const reset = () => {
    setStage("stars");
    setStarRating(null);
    setHoveredStar(null);
    setCleanedReview("");
    setEditedReview("");
    setIsEditing(false);
    setCopied(false);
    setErrorMsg("");
    finalRef.current = "";
  };

  const review = editedReview || cleanedReview;

  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center px-6 py-10">
      {/* Demo banner */}
      <div className="w-full max-w-md mb-6">
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800 text-center">
          <span className="font-medium">Live demo</span> — this is a real AI review generator.
          {" "}<Link href="/signup" className="underline underline-offset-2 hover:text-amber-900">Sign up free</Link> to use it for your restaurant.
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-2">
          <p className="text-xs tracking-widest uppercase text-stone-400">Revvue Demo</p>
          <h1 className="mt-1 font-serif text-3xl text-stone-900 tracking-tight">
            Mario&apos;s Pizzeria
          </h1>
        </div>

        {/* STARS */}
        {stage === "stars" && (
          <div className="mt-8 text-center">
            <p className="text-stone-600 leading-relaxed">How was your experience?</p>
            <div className="mt-6 flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-label={`${s} stars — ${STAR_LABELS[s - 1]}`}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => setStarRating(s)}
                  className="text-5xl leading-none transition-transform active:scale-90 select-none"
                >
                  <span
                    style={{
                      color: (hoveredStar ?? 0) >= s ? "#f59e0b" : "#d6d3d1",
                      filter: (hoveredStar ?? 0) >= s ? "drop-shadow(0 0 4px rgba(245,158,11,0.5))" : "none",
                      transition: "color 0.1s, filter 0.1s",
                    }}
                  >★</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-stone-400 h-5">
              {hoveredStar ? STAR_LABELS[hoveredStar - 1] : ""}
            </p>
            {starRating !== null && (
              <div className="mt-8">
                <div className="flex gap-1 justify-center mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className="text-3xl" style={{ color: s <= starRating ? "#f59e0b" : "#d6d3d1" }}>★</span>
                  ))}
                </div>
                <p className="text-sm text-stone-500 mb-6">
                  {STAR_LABELS[starRating - 1]} —{" "}
                  <button type="button" onClick={() => setStarRating(null)} className="underline underline-offset-4 hover:text-stone-800">
                    change
                  </button>
                </p>
                <p className="text-stone-600 mb-2">Now tell us more. Hold the button and speak.</p>

                {supportsSpeech === false ? (
                  <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-600">
                    Your browser doesn&apos;t support voice input.{" "}
                    Try Chrome on Android or Safari on iPhone.
                  </div>
                ) : (
                  <>
                    <HoldButton
                      onPointerDown={startRecording}
                      recording={false}
                    />
                    <p className="mt-5 text-xs text-stone-400">
                      Your voice never leaves your phone — we only send the text.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* RECORDING */}
        {stage === "recording" && (
          <div className="mt-8 text-center">
            <p className="text-stone-700 font-medium mb-2">Listening… keep holding.</p>
            <HoldButton
              recording
              onPointerUp={stopAndProcess}
              onPointerLeave={stopAndProcess}
              onPointerCancel={stopAndProcess}
            />
            <div className="mt-6 min-h-[3rem] text-stone-500 italic text-sm px-4">
              {interim || finalRef.current || "…"}
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {stage === "processing" && (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
            <p className="mt-5 text-stone-600">Writing your review…</p>
          </div>
        )}

        {/* READY */}
        {stage === "ready" && (
          <div className="mt-6 w-full">
            {starRating !== null && (
              <div className="flex gap-0.5 justify-center mb-3">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className="text-2xl" style={{ color: s <= starRating ? "#f59e0b" : "#d6d3d1" }}>★</span>
                ))}
              </div>
            )}
            <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5 text-left">
              {isEditing ? (
                <textarea
                  value={editedReview}
                  onChange={(e) => setEditedReview(e.target.value)}
                  rows={6}
                  className="w-full resize-none bg-transparent outline-none text-stone-900 leading-relaxed"
                  autoFocus
                />
              ) : (
                <p className="text-stone-900 leading-relaxed whitespace-pre-wrap">{review}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
                <button
                  type="button"
                  onClick={() => setIsEditing((v) => !v)}
                  className="underline underline-offset-4 hover:text-stone-800"
                >
                  {isEditing ? "Done editing" : "Edit"}
                </button>
                <span>{review.length} chars</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(review);
                } catch {
                  const ta = document.createElement("textarea");
                  ta.value = review;
                  ta.style.position = "fixed"; ta.style.opacity = "0";
                  document.body.appendChild(ta);
                  ta.select(); document.execCommand("copy");
                  document.body.removeChild(ta);
                }
                setCopied(true);
                setStage("done");
              }}
              className="mt-6 w-full rounded-full bg-stone-900 text-stone-50 font-medium py-4 text-base shadow-sm transition-transform active:scale-[0.98] hover:bg-stone-800"
            >
              {copied ? "Copied!" : "Copy review"}
            </button>
            <button type="button" onClick={reset} className="mt-3 w-full text-sm text-stone-500 hover:text-stone-800 py-2">
              Start over
            </button>
          </div>
        )}

        {/* DONE */}
        {stage === "done" && (
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-stone-900 mb-2">Review ready!</h2>
            <p className="text-stone-600 text-sm mb-8 max-w-xs">
              In real life, we&apos;d open Google and you&apos;d paste. That&apos;s the whole flow — under 30 seconds from QR scan to posted review.
            </p>

            <div className="w-full rounded-2xl bg-stone-900 text-stone-50 p-7 text-left mb-4">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Want this for your restaurant?</p>
              <p className="font-serif text-xl mb-4">Get Revvue on your tables today.</p>
              <p className="text-stone-400 text-sm mb-5">No app. No account for diners. White-label for agencies. 14-day free trial.</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-stone-50 text-stone-900 font-medium px-6 py-3 text-sm hover:bg-white transition-colors"
                >
                  Start free trial →
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-stone-600 text-stone-300 font-medium px-6 py-3 text-sm hover:bg-stone-800 transition-colors"
                >
                  Learn more
                </Link>
              </div>
            </div>

            <button type="button" onClick={reset} className="text-stone-400 text-sm underline underline-offset-4 mt-2">
              Try the demo again
            </button>
          </div>
        )}

        {/* ERROR */}
        {stage === "error" && (
          <div className="mt-8 text-center">
            <p className="text-stone-700 leading-relaxed max-w-sm mx-auto">
              {errorMsg || "Something went wrong."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-stone-900 text-stone-50 font-medium px-6 py-3 hover:bg-stone-800 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <p className="mt-10 text-[11px] tracking-widest uppercase text-stone-400">
        Powered by Revvue
      </p>
    </main>
  );
}

function HoldButton({
  recording,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}: {
  recording: boolean;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  onPointerCancel?: () => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => { e.preventDefault(); onPointerDown?.(); }}
      onPointerUp={(e) => { e.preventDefault(); onPointerUp?.(); }}
      onPointerLeave={() => onPointerLeave?.()}
      onPointerCancel={() => onPointerCancel?.()}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        "mt-8 select-none touch-none mx-auto",
        "w-44 h-44 rounded-full flex items-center justify-center",
        "text-stone-50 font-medium text-base tracking-wide shadow-lg transition-transform",
        recording
          ? "bg-red-600 animate-pulse scale-105"
          : "bg-stone-900 hover:bg-stone-800 active:scale-95",
      ].join(" ")}
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
      aria-label={recording ? "Release to finish" : "Hold to speak"}
    >
      <span className="px-4 text-center leading-tight">
        {recording ? "Release to finish" : "Hold to speak"}
      </span>
    </button>
  );
}
