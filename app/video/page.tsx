"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const DURATIONS = [4500, 5000, 6000, 6000, 5000, 5500];

function useScene() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setScene((s) => (s + 1) % 6), DURATIONS[scene]);
    return () => clearTimeout(t);
  }, [scene]);
  return scene;
}

const ease = [0.16, 1, 0.3, 1];

function S1() {
  const [show, setShow] = useState(false);
  const [showSub, setShowSub] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setShow(true), 100);
    const b = setTimeout(() => setShowSub(true), 1800);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: "#000" }}
      initial={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}>
      <div style={{ overflow: "hidden", lineHeight: 1 }}>
        <motion.div
          style={{ fontSize: "clamp(3rem, 9vw, 7rem)", fontWeight: 900, color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}
          initial={{ y: "110%", opacity: 0 }}
          animate={show ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, ease }}>
          Nobody leaves
        </motion.div>
      </div>
      <div style={{ overflow: "hidden", lineHeight: 1 }}>
        <motion.div
          style={{ fontSize: "clamp(3rem, 9vw, 7rem)", fontWeight: 900, color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}
          initial={{ y: "110%", opacity: 0 }}
          animate={show ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, ease, delay: 0.08 }}>
          a{" "}
          <motion.span
            initial={{ color: "#fff" }}
            animate={showSub ? { color: "#22c55e" } : {}}
            transition={{ duration: 0.4 }}>
            review.
          </motion.span>
        </motion.div>
      </div>
      <motion.div
        style={{ marginTop: "3rem", fontSize: "clamp(0.9rem, 2vw, 1.4rem)", color: "#666", fontFamily: "system-ui, sans-serif", fontWeight: 400, letterSpacing: "-0.01em" }}
        initial={{ opacity: 0 }}
        animate={showSub ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}>
        Even when they had a great time.
      </motion.div>
    </motion.div>
  );
}

function S2() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [200, 1000, 2200, 3500].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: "#000" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "left", maxWidth: "70vw" }}>
        {[
          { text: '"I should leave a review."', delay: 0 },
          { text: '"I\'ll do it later."', delay: 0.1 },
          { text: '"..."', delay: 0.2 },
        ].map((item, i) => (
          <div key={i} style={{ overflow: "hidden" }}>
            <motion.div
              style={{ fontSize: "clamp(1.6rem, 4.5vw, 3.5rem)", fontWeight: 700, color: i === 2 ? "#444" : "#fff", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.03em", position: "relative" }}
              initial={{ y: "110%" }}
              animate={phase >= i + 1 ? { y: 0 } : {}}
              transition={{ duration: 0.55, ease, delay: item.delay }}>
              {item.text}
              {i === 1 && phase >= 3 && (
                <motion.div
                  style={{ position: "absolute", left: 0, right: 0, top: "52%", height: "3px", background: "#ef4444", transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease }}
                />
              )}
            </motion.div>
          </div>
        ))}
      </div>
      <motion.div
        style={{ marginTop: "3rem", fontSize: "clamp(0.85rem, 1.8vw, 1.2rem)", color: "#555", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.01em" }}
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}>
        72% intend to. 8% follow through.
      </motion.div>
    </motion.div>
  );
}

function S3() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [100, 900, 2000, 3500, 4500].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center"
      style={{ background: "#000" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}>
      <div style={{ display: "flex", gap: "8vw", alignItems: "center", width: "85vw", maxWidth: "900px" }}>
        <div style={{ flex: 1 }}>
          {["Scan.", "Speak.", "Done."].map((word, i) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <motion.div
                style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", fontWeight: 900, color: i === 2 ? "#22c55e" : "#fff", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.04em", lineHeight: 1.05 }}
                initial={{ y: "110%" }}
                animate={phase >= i + 1 ? { y: 0 } : {}}
                transition={{ duration: 0.55, ease, delay: i * 0.04 }}>
                {word}
              </motion.div>
            </div>
          ))}
          <motion.div
            style={{ marginTop: "1.5rem", fontSize: "clamp(0.8rem, 1.6vw, 1rem)", color: "#555", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}
            initial={{ opacity: 0 }} animate={phase >= 5 ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}>
            No app. No login. QR on your counter.<br />15 seconds. That&apos;s it.
          </motion.div>
        </div>
        <motion.div
          style={{ width: "min(18vw, 180px)", height: "min(36vw, 360px)", border: "2px solid #222", borderRadius: "1.8rem", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "15%", overflow: "hidden", position: "relative", flexShrink: 0 }}
          initial={{ y: 40, opacity: 0 }}
          animate={phase >= 1 ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease }}>
          <div style={{ position: "absolute", top: "4%", width: "25%", height: "3px", background: "#222", borderRadius: "10px" }} />
          <motion.div initial={{ opacity: 0 }} animate={phase >= 2 ? { opacity: 1 } : {}} transition={{ duration: 0.4 }}>
            <div style={{ fontSize: "clamp(0.5rem, 1vw, 0.8rem)", color: "#22c55e", fontFamily: "system-ui, sans-serif", fontWeight: 700, textAlign: "center", letterSpacing: "0.05em" }}>REVVUE</div>
            <div style={{ fontSize: "clamp(0.4rem, 0.7vw, 0.6rem)", color: "#444", textAlign: "center", marginTop: "2px", fontFamily: "system-ui, sans-serif" }}>{"Mario's Kitchen"}</div>
          </motion.div>
          <div style={{ display: "flex", gap: "4px", margin: "8% 0" }}>
            {[1,2,3,4,5].map(s => (
              <motion.div key={s}
                style={{ width: "min(1.8vw, 18px)", height: "min(1.8vw, 18px)", background: "#22c55e", borderRadius: "2px", transform: "rotate(45deg)" }}
                initial={{ scale: 0 }}
                animate={phase >= 3 ? { scale: 1 } : {}}
                transition={{ type: "spring", delay: s * 0.06, stiffness: 400, damping: 20 }} />
            ))}
          </div>
          <motion.div
            style={{ width: "min(7vw, 70px)", height: "min(7vw, 70px)", borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "1.5px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
            initial={{ scale: 0 }} animate={phase >= 3 ? { scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.3 }}>
            <motion.div
              style={{ width: "65%", height: "65%", borderRadius: "50%", background: "#22c55e" }}
              animate={phase >= 4 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}>
              <svg viewBox="0 0 24 24" fill="white" width="100%" height="100%" style={{ padding: "25%" }}>
                <path d="M12 14a2 2 0 0 0 2-2V5a2 2 0 0 0-4 0v7a2 2 0 0 0 2 2zm6-2a6 6 0 0 1-12 0H4a8 8 0 0 0 16 0h-2z"/>
              </svg>
            </motion.div>
            {phase >= 4 && [0,1].map(i => (
              <motion.div key={i} className="absolute"
                style={{ width: "100%", height: "100%", borderRadius: "50%", border: "1px solid rgba(34,197,94,0.3)" }}
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.7 }} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function S4() {
  const [phase, setPhase] = useState(0);
  const bars = useRef(Array.from({ length: 28 }, (_, i) => 15 + Math.sin(i * 1.2) * 50 + Math.cos(i * 0.7) * 25)).current;
  useEffect(() => {
    const ts = [300, 2000, 3800].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: "#000" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}>
      <motion.div
        style={{ fontSize: "clamp(0.7rem, 1.5vw, 1rem)", color: "#444", fontFamily: "system-ui, sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "2rem" }}
        initial={{ opacity: 0 }} animate={phase >= 1 ? { opacity: 1 } : {}}>
        AI processing
      </motion.div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "min(0.5vw, 5px)", height: "8vh", marginBottom: "2.5rem" }}>
        {bars.map((h, i) => (
          <motion.div key={i}
            style={{ width: "min(1.3vw, 11px)", borderRadius: "2px" }}
            initial={{ height: "4px", background: "#222" }}
            animate={
              phase === 0 ? { height: "4px", background: "#222" }
              : phase === 1 ? { height: `${h}%`, background: "#22c55e" }
              : { height: "4px", background: "#22c55e", opacity: 0.3 }
            }
            transition={phase === 1
              ? { duration: 0.3 + (i % 5) * 0.08, repeat: Infinity, repeatType: "reverse" as const, delay: i * 0.025 }
              : { duration: 0.5, delay: i * 0.01 }} />
        ))}
      </div>
      <motion.div
        style={{ maxWidth: "min(55vw, 600px)", border: "1px solid #1a1a1a", background: "#0d0d0d", borderRadius: "1rem", padding: "2rem 2.5rem", position: "relative", overflow: "hidden" }}
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease }}>
        <motion.div
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "#22c55e", transformOrigin: "top" }}
          initial={{ scaleY: 0 }}
          animate={phase >= 2 ? { scaleY: 1 } : {}}
          transition={{ duration: 0.4 }} />
        <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "clamp(0.9rem, 1.8vw, 1.25rem)", color: "#e5e5e5", lineHeight: 1.65, margin: 0 }}>
          &ldquo;The food was outstanding and the staff were incredibly welcoming. Best meal I&apos;ve had this year — I&apos;ll be back for sure.&rdquo;
        </p>
        <motion.div
          style={{ marginTop: "1rem", display: "flex", gap: "0.3rem" }}
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ color: "#22c55e", fontSize: "1rem" }}>★</span>
          ))}
        </motion.div>
      </motion.div>
      <motion.div
        style={{ marginTop: "2rem", fontSize: "clamp(0.8rem, 1.6vw, 1.1rem)", color: "#555", fontFamily: "system-ui, sans-serif" }}
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}>
        Copied to clipboard. Google opens. They paste. Done.
      </motion.div>
    </motion.div>
  );
}

function S5() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [200, 1200, 2400, 3800].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const stats = [
    { n: "3×", label: "more reviews" },
    { n: "92%", label: "completion rate" },
    { n: "0", label: "app downloads" },
  ];
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: "#000" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}>
      <div style={{ overflow: "hidden" }}>
        <motion.div
          style={{ fontSize: "clamp(0.8rem, 1.5vw, 1rem)", color: "#22c55e", fontFamily: "system-ui, sans-serif", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}
          initial={{ y: "110%" }} animate={phase >= 1 ? { y: 0 } : {}} transition={{ duration: 0.5, ease }}>
          The results
        </motion.div>
      </div>
      <div style={{ display: "flex", gap: "min(6vw, 5rem)", marginTop: "3rem", alignItems: "flex-start" }}>
        {stats.map((s, i) => (
          <motion.div key={i}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= i + 2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}>
            <span style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 900, color: "#fff", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.n}</span>
            <span style={{ fontSize: "clamp(0.7rem, 1.4vw, 1rem)", color: "#555", fontFamily: "system-ui, sans-serif", marginTop: "0.4rem" }}>{s.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        style={{ marginTop: "3.5rem", padding: "0.8rem 2rem", border: "1px solid #22c55e", borderRadius: "100px", fontSize: "clamp(0.75rem, 1.4vw, 1rem)", color: "#22c55e", fontFamily: "system-ui, sans-serif" }}
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}>
        Works for any local business
      </motion.div>
    </motion.div>
  );
}

function S6() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [300, 1400, 2800, 4200].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: "#000" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}>
      <div style={{ overflow: "hidden" }}>
        <motion.div
          style={{ fontSize: "clamp(4rem, 14vw, 10rem)", fontWeight: 900, color: "#fff", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.05em", lineHeight: 0.9 }}
          initial={{ y: "110%" }}
          animate={phase >= 1 ? { y: 0 } : {}}
          transition={{ duration: 0.7, ease }}>
          Revvue
          <motion.span
            style={{ color: "#22c55e" }}
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : {}}
            transition={{ duration: 0.3 }}>
            .
          </motion.span>
        </motion.div>
      </div>
      <motion.div
        style={{ height: "2px", background: "#fff", marginTop: "1.5rem", originX: 0, width: "min(40vw, 360px)" }}
        initial={{ scaleX: 0 }}
        animate={phase >= 2 ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, ease, delay: 0.1 }} />
      <motion.p
        style={{ fontSize: "clamp(0.8rem, 2vw, 1.3rem)", color: "#555", fontFamily: "system-ui, sans-serif", marginTop: "1.5rem", letterSpacing: "0.05em" }}
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}>
        The review they&apos;ll actually leave.
      </motion.p>
      <motion.div
        style={{ marginTop: "3rem", display: "flex", gap: "1.5rem", alignItems: "center" }}
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}>
        <Link href="/demo" style={{ background: "#22c55e", color: "#000", fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: "clamp(0.75rem, 1.3vw, 1rem)", padding: "0.75rem 2rem", borderRadius: "100px", textDecoration: "none" }}>
          Try it free →
        </Link>
        <Link href="/" style={{ color: "#444", fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)", fontFamily: "system-ui, sans-serif", textDecoration: "none" }}>
          revvue.live
        </Link>
      </motion.div>
      <motion.div
        style={{ position: "absolute", bottom: "2.5rem", fontSize: "clamp(0.5rem, 0.9vw, 0.75rem)", color: "#333", fontFamily: "system-ui, sans-serif", letterSpacing: "0.1em" }}
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}>
        REPLIT 10-YEAR BUILDATHON
      </motion.div>
    </motion.div>
  );
}

export default function VideoPage() {
  const scene = useScene();
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: "hidden", position: "relative" }}>
      <Link href="/" style={{ position: "absolute", top: "1.5rem", left: "1.75rem", zIndex: 50, color: "#333", fontFamily: "system-ui, sans-serif", fontSize: "0.8rem", letterSpacing: "0.05em", textDecoration: "none" }}>
        ← revvue.live
      </Link>
      <AnimatePresence initial={false} mode="wait">
        {scene === 0 && <S1 key="s1" />}
        {scene === 1 && <S2 key="s2" />}
        {scene === 2 && <S3 key="s3" />}
        {scene === 3 && <S4 key="s4" />}
        {scene === 4 && <S5 key="s5" />}
        {scene === 5 && <S6 key="s6" />}
      </AnimatePresence>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "#111" }}>
        <motion.div
          key={scene}
          style={{ height: "100%", background: "#22c55e", transformOrigin: "left" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATIONS[scene] / 1000, ease: "linear" }} />
      </div>
    </div>
  );
}
