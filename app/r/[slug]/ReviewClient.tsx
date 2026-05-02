"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// White-label branding contract. The legacy /r/[slug] route and the new
// agency-scoped /_agency/[agencySlug]/r/[slug] route both pass this in.
// Keep it small — only what affects the customer-facing review surface.
export type ReviewBranding = {
  agencyName: string;
  logoUrl: string | null;
  primaryColor: string;
  fontFamily: string;
};

const DEFAULT_BRANDING: ReviewBranding = {
  agencyName: "Revvue",
  logoUrl: null,
  primaryColor: "#1c1917",
  fontFamily: "serif",
};

type Props = {
  clientId: string;
  businessName: string;
  googleReviewLink: string;
  branding?: ReviewBranding;
};

type UiState =
  | "idle"
  | "recording"
  | "processing"
  | "ready"
  | "redirecting"
  | "posted"
  | "error";

// Minimum characters we consider a real review attempt. Below this we assume
// the customer tapped by accident or the mic didn't catch anything.
const MIN_TRANSCRIPT_CHARS = 5;

export default function ReviewClient({
  clientId,
  businessName,
  googleReviewLink,
  branding = DEFAULT_BRANDING,
}: Props) {
  const { agencyName, logoUrl, primaryColor, fontFamily } = branding;
  const [state, setState] = useState<UiState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [interim, setInterim] = useState<string>("");
  const [cleanedReview, setCleanedReview] = useState<string>("");
  const [editedReview, setEditedReview] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState<boolean | null>(null);

  // Accumulated final transcript must live in a ref — React state updates are
  // async and we'd lose chunks between speech-recognition events.
  const finalRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);
  const recordingRef = useRef(false);

  useEffect(() => {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition)) ||
      null;
    setSupportsSpeech(!!SR);
  }, []);

  const startRecording = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupportsSpeech(false);
      return;
    }

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
        const res = ev.results[i];
        const chunk = res[0]?.transcript ?? "";
        if (res.isFinal) {
          finalRef.current = (finalRef.current + " " + chunk).trim();
        } else {
          interimStr += chunk;
        }
      }
      setInterim(interimStr);
    };

    rec.onerror = (ev: any) => {
      const code: string = ev?.error ?? "unknown";
      // no-speech just means the customer paused — not a real error.
      if (code === "no-speech" || code === "aborted") return;

      recordingRef.current = false;
      try { rec.stop(); } catch { /* noop */ }

      if (code === "not-allowed" || code === "permission-denied") {
        setErrorMsg(
          "We need microphone permission. Tap the lock icon in your browser and allow the mic, then try again."
        );
      } else if (code === "audio-capture") {
        setErrorMsg(
          "We couldn't access your microphone. Make sure nothing else is using it, then try again."
        );
      } else {
        setErrorMsg("Something went wrong with the mic. Try again.");
      }
      setState("error");
    };

    rec.onend = () => {
      // If the user is still holding, Chrome may end the session on its own.
      // Restart to keep recording as long as the finger is down.
      if (recordingRef.current) {
        try { rec.start(); } catch { /* already started */ }
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      recordingRef.current = true;
      setState("recording");
    } catch (err) {
      console.error("recognition.start failed:", err);
      setErrorMsg("Couldn't start recording. Try again.");
      setState("error");
    }
  }, []);

  const stopRecordingAndProcess = useCallback(async () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;

    const rec = recognitionRef.current;
    try { rec?.stop(); } catch { /* noop */ }
    recognitionRef.current = null;

    // Give the recognizer a tick to flush any last final result.
    await new Promise((r) => setTimeout(r, 150));

    const transcript = (finalRef.current || interim).trim();
    setInterim("");

    if (transcript.length < MIN_TRANSCRIPT_CHARS) {
      setErrorMsg(
        "We didn't catch that. Hold the button a little longer and speak into the phone."
      );
      setState("error");
      return;
    }

    setState("processing");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transcript,
          businessName,
          clientId,
        }),
      });

      if (!res.ok) {
        // graceful fallback — show the raw transcript instead of failing
        setCleanedReview(transcript);
        setEditedReview(transcript);
        setState("ready");
        return;
      }

      const data: { review?: string } = await res.json();
      const review = (data.review && data.review.trim()) || transcript;
      setCleanedReview(review);
      setEditedReview(review);
      setState("ready");
    } catch (err) {
      console.error("generate failed:", err);
      setCleanedReview(transcript);
      setEditedReview(transcript);
      setState("ready");
    }
  }, [businessName, clientId, interim]);

  // Unified post flow for all platforms:
  //   1. Copy review text to clipboard (async with execCommand fallback)
  //   2. Show instruction overlay (redirecting phase)
  //   3. Overlay's "Open Google" button calls openGoogleReview() as a fresh
  //      gesture — on Android it fires an intent URL straight into Maps, on
  //      iOS a comgooglemaps:// deep link, on desktop a new tab.
  //
  // We intentionally do NOT use navigator.share(): Google Maps is not a
  // standard share target on Android, so the system sheet dumps users into a
  // generic copy-link flow instead of the review screen.
  const handlePost = useCallback(async () => {
    const text = (isEditing ? editedReview : cleanedReview).trim();
    if (!text) return;

    try {
      if (
        typeof navigator !== "undefined" &&
        !!navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(text);
      } else {
        execCopy(text);
      }
    } catch {
      execCopy(text);
    }

    setState("redirecting");
  }, [cleanedReview, editedReview, isEditing]);

  // Called from the "Open Google" button inside the redirecting overlay.
  // This is its own user gesture, so navigation is always allowed.
  const openGoogleReview = useCallback(() => {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);

    // Google Maps review URLs typically include ?placeid=... or ?cid=...
    const placeIdMatch = googleReviewLink.match(/placeid=([^&]+)/i);
    const placeId = placeIdMatch ? placeIdMatch[1] : null;

    if (placeId && isIOS) {
      // iOS: try Google Maps app deep link, fall back to web after 1.5s
      // if the app isn't installed / URL scheme isn't handled.
      const deepLink = `comgooglemaps://?q=place_id:${placeId}&action=write_review`;
      window.location.href = deepLink;
      setTimeout(() => {
        window.location.href = googleReviewLink;
      }, 1500);
      setState("posted");
      return;
    }

    if (placeId && isAndroid) {
      // Android: intent URL with browser_fallback_url so it works without Maps.
      const intentUrl =
        `intent://maps.google.com/?cid=${placeId}&action=write_review` +
        `#Intent;scheme=https;package=com.google.android.apps.maps;` +
        `S.browser_fallback_url=${encodeURIComponent(googleReviewLink)};end`;
      window.location.href = intentUrl;
      setState("posted");
      return;
    }

    // Desktop or unknown — standard new tab
    const newTab = window.open(googleReviewLink, "_blank", "noopener,noreferrer");
    if (!newTab) {
      window.location.href = googleReviewLink;
    } else {
      setState("posted");
    }
  }, [googleReviewLink]);

  const resetToIdle = () => {
    finalRef.current = "";
    setInterim("");
    setErrorMsg("");
    setCleanedReview("");
    setEditedReview("");
    setIsEditing(false);
    setState("idle");
  };

  if (supportsSpeech === false) {
    return (
      <Shell agencyName={agencyName}>
        <div className="max-w-md w-full text-center">
          <BrandHeader logoUrl={logoUrl} agencyName={agencyName} />
          <h1
            className="mt-2 text-3xl text-stone-900 tracking-tight"
            style={{ fontFamily }}
          >
            {businessName}
          </h1>
          <p className="mt-3 text-stone-600">
            Your browser doesn&apos;t support voice input. Please open this link
            in Chrome (Android) or Safari (iPhone) and try again.
          </p>
          <a
            href={googleReviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-full text-stone-50 font-medium px-6 py-3"
            style={{ backgroundColor: primaryColor }}
          >
            Leave a Google review instead
          </a>
        </div>
      </Shell>
    );
  }

  return (
    <Shell agencyName={agencyName}>
      <div className="max-w-md w-full text-center flex flex-col items-center">
        <BrandHeader logoUrl={logoUrl} agencyName={agencyName} />
        <h1
          className="mt-2 text-3xl sm:text-4xl text-stone-900 tracking-tight"
          style={{ fontFamily }}
        >
          {businessName}
        </h1>

        {state === "idle" && (
          <>
            <p className="mt-4 text-stone-600 leading-relaxed">
              Tell us how your meal was. Hold the button and speak for about
              10 seconds.
            </p>

            <HoldButton
              label="Hold to speak"
              primaryColor={primaryColor}
              onPointerDown={startRecording}
            />

            <p className="mt-6 text-xs text-stone-500">
              Your voice never leaves your phone. We only send the text.
            </p>
          </>
        )}

        {state === "recording" && (
          <>
            <p className="mt-4 text-stone-700 font-medium">
              Listening… keep holding.
            </p>

            <HoldButton
              label="Release to finish"
              recording
              primaryColor={primaryColor}
              onPointerUp={stopRecordingAndProcess}
              onPointerLeave={stopRecordingAndProcess}
              onPointerCancel={stopRecordingAndProcess}
            />

            <div className="mt-6 min-h-[3rem] text-stone-600 italic text-sm px-4">
              {interim || finalRef.current || "…"}
            </div>
          </>
        )}

        {state === "processing" && (
          <div className="mt-10 flex flex-col items-center">
            <Spinner />
            <p className="mt-4 text-stone-600">Writing your review…</p>
          </div>
        )}

        {state === "ready" && (
          <div className="mt-6 w-full">
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
                <p className="text-stone-900 leading-relaxed whitespace-pre-wrap">
                  {editedReview || cleanedReview}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
                <button
                  type="button"
                  onClick={() => setIsEditing((v) => !v)}
                  className="underline underline-offset-4 hover:text-stone-800"
                >
                  {isEditing ? "Done editing" : "Edit"}
                </button>
                <span>
                  {(editedReview || cleanedReview).length} chars
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePost}
              className="mt-6 w-full rounded-full text-stone-50 font-medium py-4 text-base shadow-sm transition-transform active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}
            >
              Post to Google
            </button>

            <button
              type="button"
              onClick={resetToIdle}
              className="mt-3 w-full text-sm text-stone-500 hover:text-stone-800 py-2"
            >
              Start over
            </button>
          </div>
        )}

        {state === "redirecting" && (
          <div className="mt-6 w-full max-w-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
              Review copied
            </p>
            <h2
              className="text-2xl text-stone-900 mb-8 text-center"
              style={{ fontFamily }}
            >
              Two quick taps on Google
            </h2>

            <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-stone-200 mb-6">
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    1
                  </div>
                  <div className="text-left pt-1">
                    <p className="text-stone-900 font-medium">
                      Tap the review box
                    </p>
                    <p className="text-stone-500 text-sm mt-0.5">
                      Where it says &ldquo;Share details&hellip;&rdquo;
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    2
                  </div>
                  <div className="text-left pt-1">
                    <p className="text-stone-900 font-medium">
                      Long-press, tap Paste
                    </p>
                    <p className="text-stone-500 text-sm mt-0.5">
                      Your review is already copied
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openGoogleReview}
              className="w-full py-4 text-white rounded-full text-lg font-medium active:scale-[0.98] transition-transform"
              style={{ backgroundColor: primaryColor }}
            >
              Open Google →
            </button>

            <button
              type="button"
              onClick={() => setState("ready")}
              className="mt-4 text-stone-500 text-sm underline"
            >
              Go back
            </button>
          </div>
        )}

        {state === "posted" && (
          <div className="mt-6 flex flex-col items-center text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2
              className="text-2xl text-stone-900 mb-3"
              style={{ fontFamily }}
            >
              Thanks for the review!
            </h2>
            <p className="text-stone-600 mb-6">
              If it didn&apos;t post, your review is still copied — tap below
              to try again.
            </p>
            <button
              type="button"
              onClick={openGoogleReview}
              className="px-6 py-3 text-white rounded-full text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Open Google again
            </button>
            <button
              type="button"
              onClick={resetToIdle}
              className="mt-4 text-stone-400 text-xs"
            >
              Leave another review
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="mt-6 w-full text-center">
            <p className="text-stone-800 leading-relaxed">
              {errorMsg || "Something went wrong."}
            </p>
            <button
              type="button"
              onClick={resetToIdle}
              className="mt-6 inline-flex items-center justify-center rounded-full text-stone-50 font-medium px-6 py-3"
              style={{ backgroundColor: primaryColor }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({
  children,
  agencyName,
}: {
  children: React.ReactNode;
  agencyName?: string;
}) {
  return (
    <main className="min-h-screen h-dvh bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center px-6 py-10">
      <div className="flex-1 w-full flex items-center justify-center">
        {children}
      </div>
      {agencyName ? (
        <p className="mt-6 text-[11px] tracking-widest uppercase text-stone-400">
          Powered by {agencyName}
        </p>
      ) : null}
    </main>
  );
}

function BrandHeader({
  logoUrl,
  agencyName,
}: {
  logoUrl: string | null;
  agencyName: string;
}) {
  if (logoUrl) {
    return (
      // Using a plain <img> on purpose — agency logos are arbitrary external
      // URLs (Imgur, Cloudinary, etc.) and we don't want to wire next/image
      // remotePatterns just for this. Constrained height keeps layout stable.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={agencyName}
        className="h-8 sm:h-10 w-auto object-contain mx-auto"
      />
    );
  }
  return (
    <p className="text-sm tracking-widest uppercase text-stone-500">
      {agencyName}
    </p>
  );
}

type HoldButtonProps = {
  label: string;
  recording?: boolean;
  primaryColor?: string;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
  onPointerCancel?: () => void;
};

function HoldButton({
  label,
  recording,
  primaryColor,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}: HoldButtonProps) {
  // Recording state stays red regardless of branding — it's a function
  // indicator (mic is hot) rather than a brand surface. Idle state takes
  // the agency's primary color.
  const idleStyle = primaryColor
    ? { backgroundColor: primaryColor }
    : undefined;

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        // Prevent context-menu on long press (Android) and text selection
        e.preventDefault();
        onPointerDown?.();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onPointerUp?.();
      }}
      onPointerLeave={() => onPointerLeave?.()}
      onPointerCancel={() => onPointerCancel?.()}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        "mt-10 select-none touch-none",
        "w-44 h-44 sm:w-48 sm:h-48 rounded-full",
        "flex items-center justify-center",
        "text-stone-50 font-medium text-base tracking-wide",
        "shadow-lg transition-transform",
        recording
          ? "bg-red-600 animate-pulse scale-105"
          : primaryColor
            ? "active:scale-95"
            : "bg-stone-900 hover:bg-stone-800 active:scale-95",
      ].join(" ")}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        ...(recording ? {} : idleStyle ?? {}),
      }}
      aria-label={label}
    >
      <span className="px-4 text-center leading-tight">{label}</span>
    </button>
  );
}

function Spinner() {
  return (
    <div
      className="h-10 w-10 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin"
      aria-label="Loading"
    />
  );
}

// Synchronous clipboard fallback for older Safari / non-secure contexts.
function execCopy(text: string) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch (err) {
    console.error("execCommand copy failed:", err);
  }
}
