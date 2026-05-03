import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Start your Revvue trial — Sign up",
  description:
    "Spin up your white-label voice review brand in two minutes. 14-day free trial.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-white">
            Revvue
          </Link>
          <Link
            href="/agencies"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Back to overview
          </Link>
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
