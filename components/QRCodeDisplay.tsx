"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  url: string;
  businessName: string;
  size?: number;
  fgColor?: string;
};

// Renders a QR code on canvas + provides PNG download. We render via
// qrcode.react (canvas) so we can read pixel data straight off the DOM
// without an extra round-trip through the API. The /api/clients/[id]/qr
// endpoint exists for printing/emailing programmatically.
export default function QRCodeDisplay({
  url,
  businessName,
  size = 256,
  fgColor = "#1c1917",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  function downloadPng() {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${slugifyForFilename(businessName)}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("clipboard copy failed", err);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
      >
        <QRCodeCanvas
          value={url}
          size={size}
          level="H"
          includeMargin
          fgColor={fgColor}
          bgColor="#ffffff"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={downloadPng}
          className="rounded-full bg-stone-900 text-stone-50 text-sm px-4 py-2 hover:bg-stone-800 transition-colors"
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={copyUrl}
          className="rounded-full border border-stone-300 text-stone-800 text-sm px-4 py-2 hover:bg-stone-100 transition-colors"
        >
          {copied ? "Copied!" : "Copy URL"}
        </button>
      </div>
      <p className="mt-3 text-xs text-stone-500 break-all text-center max-w-xs">
        {url}
      </p>
    </div>
  );
}

function slugifyForFilename(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "qr"
  );
}
