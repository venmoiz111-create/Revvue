"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  url: string;
  businessName: string;
  size?: number;
  fgColor?: string;
};

export default function QRCodeDisplay({
  url,
  businessName,
  size = 240,
  fgColor = "#000000",
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
        className="bg-white rounded-2xl p-5 inline-block"
      >
        <QRCodeCanvas
          value={url}
          size={size}
          level="H"
          includeMargin={false}
          fgColor={fgColor}
          bgColor="#ffffff"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 w-full">
        <button
          type="button"
          onClick={downloadPng}
          className="rounded-full bg-green-500 text-black text-sm font-bold px-5 py-2 hover:bg-green-400 transition-colors"
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={copyUrl}
          className="rounded-full border border-zinc-700 text-zinc-400 text-sm px-5 py-2 hover:bg-zinc-900 hover:text-white transition-colors"
        >
          {copied ? "Copied!" : "Copy URL"}
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-700 break-all text-center max-w-xs font-mono">
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
