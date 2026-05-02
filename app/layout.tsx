import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Revvue — Voice-powered Google reviews",
  description:
    "Your customers speak. We clean it up. You get more 5-star reviews.",
  metadataBase: new URL("https://revvue.live"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-stone-900 bg-stone-50">{children}</body>
    </html>
  );
}
