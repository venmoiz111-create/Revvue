import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revvue — See how it works",
  description: "Watch how Revvue turns 15 seconds of voice into a perfect Google review for any local business.",
};

export default function VideoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
