"use client";

import { useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  businessName: string;
  reviewUrl: string;
  agencyName: string;
};

export default function PrintQR({ businessName, reviewUrl, agencyName }: Props) {
  useEffect(() => {
    // Small delay so QR canvas renders before print dialog opens
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Print styles injected via a style tag */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          margin: 0;
          background: white;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .no-print {
          display: block;
        }
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen: close button */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-black text-white font-bold px-4 py-2 text-sm shadow"
        >
          Print again
        </button>
        <button
          onClick={() => window.close()}
          className="rounded-full border border-zinc-300 text-zinc-700 font-medium px-4 py-2 text-sm shadow bg-white"
        >
          Close
        </button>
      </div>

      {/* Print card — centred on the page */}
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: 360,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Top half — instruction */}
          <div
            style={{
              width: "100%",
              borderRadius: "16px 16px 0 0",
              background: "#000",
              color: "#fff",
              padding: "28px 24px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#71717a",
                fontWeight: 600,
              }}
            >
              Leave us a review
            </p>
            <h1
              style={{
                margin: "10px 0 0",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "#fff",
              }}
            >
              {businessName}
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 13,
                color: "#a1a1aa",
                lineHeight: 1.5,
              }}
            >
              Scan the code below. Hold the button. Speak for 15&nbsp;seconds.
              Your review posts to Google automatically.
            </p>
          </div>

          {/* QR code */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e4e4e7",
              borderTop: "none",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <QRCodeCanvas
              value={reviewUrl}
              size={220}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
            />
            <p
              style={{
                marginTop: 14,
                fontSize: 10,
                color: "#a1a1aa",
                fontFamily: "monospace",
                wordBreak: "break-all",
                textAlign: "center",
                maxWidth: 220,
              }}
            >
              {reviewUrl}
            </p>
          </div>

          {/* Bottom — steps */}
          <div
            style={{
              width: "100%",
              borderRadius: "0 0 16px 16px",
              background: "#f4f4f5",
              border: "1px solid #e4e4e7",
              borderTop: "none",
              padding: "16px 24px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              {[
                { n: "1", label: "Scan QR" },
                { n: "2", label: "Pick stars" },
                { n: "3", label: "Hold + speak" },
                { n: "4", label: "Tap post" },
              ].map((s) => (
                <div
                  key={s.n}
                  style={{ textAlign: "center", flex: 1 }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#22c55e",
                      color: "#000",
                      fontWeight: 900,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                    }}
                  >
                    {s.n}
                  </div>
                  <p
                    style={{
                      margin: "5px 0 0",
                      fontSize: 10,
                      color: "#52525b",
                      fontWeight: 500,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Powered by */}
          <p
            style={{
              marginTop: 14,
              fontSize: 9,
              color: "#d4d4d8",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Powered by {agencyName}
          </p>
        </div>
      </div>
    </>
  );
}
