import type { Metadata } from "next";
import LoginLookup from "./LoginLookup";

export const metadata: Metadata = {
  title: "Sign in — Revvue",
  description: "Sign in to your Revvue dashboard.",
};

export default function LoginPage() {
  return <LoginLookup />;
}
