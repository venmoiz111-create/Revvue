"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

const SCENE_DURATIONS = [6000, 7000, 9000, 8000, 8000, 7000];

function useVideoPlayer() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setScene((s) => (s + 1) % 6), SCENE_DURATIONS[scene]);
    return () => clearTimeout(t);
  }, [scene]);
  return scene;
}

// ── Scene 1: Hook ─────────────────────────────────────────────────────────────
function Scene1() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [300, 1200, 2800, 4500].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const words = ["Nobody", "types", "a", "review", "anymore."];
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#1c1917" }}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute rounded-full"
          style={{ width: "60vw", height: "60vw", border: "1px solid rgba(217,119,6,0.1)", left: "20vw", top: "20vh" }}
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
        />
      </div>
      <div className="relative z-10 text-center px-8 sm:px-16">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 1.5vw" }}>
          {words.map((word, i) => (
            <motion.span
              key={i}
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2.5rem, 7vw, 6rem)", fontWeight: 700, color: "#fafaf9", lineHeight: 1.1, display: "inline-block" }}
              initial={{ opacity: 0, y: 50, rotateX: 45 }}
              animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ type: "spring", stiffness: 180, damping: 18, delay: i * 0.12 }}
            >
              {word}
            </motion.span>
          ))}
        </div>
        <motion.div
          style={{ height: "2px", backgroundColor: "#d97706", marginTop: "2.5vh", originX: 0 }}
          initial={{ scaleX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
        <motion.p
          style={{ color: "#78716c", fontSize: "clamp(0.75rem, 1.8vw, 1.1rem)", marginTop: "2vh", fontFamily: "Inter, sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}
          initial={{ opacity: 0, y: 10 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          The local business review problem
        </motion.p>
      </div>
      <motion.div
        className="absolute bottom-8 right-8"
        style={{ color: "#d97706", fontSize: "clamp(0.6rem, 1.2vw, 0.9rem)", fontFamily: "Inter, sans-serif", letterSpacing: "0.2em" }}
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 0.7 } : {}}
      >
        REVVUE
      </motion.div>
    </motion.div>
  );
}

// ── Scene 2: Problem ──────────────────────────────────────────────────────────
function Scene2() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [600, 1800, 3500, 5500].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#1c1917" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="relative z-10 flex flex-col items-center" style={{ width: "80vw", maxWidth: "700px" }}>
        <motion.div
          style={{ width: "100%", border: "1px solid rgba(120,113,108,0.25)", borderRadius: "1.5rem", backgroundColor: "rgba(28,25,23,0.9)", padding: "2.5rem", position: "relative", overflow: "hidden" }}
          initial={{ y: 60, opacity: 0 }}
          animate={phase >= 1 ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: "rgba(120,113,108,0.2)" }} />
            <div style={{ width: "8rem", height: "0.6rem", backgroundColor: "rgba(120,113,108,0.15)", borderRadius: "4px" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                style={{ width: "2rem", height: "2rem", backgroundColor: "rgba(120,113,108,0.12)", borderRadius: "3px", transform: "rotate(45deg)" }}
                animate={phase >= 2 ? { backgroundColor: i <= 3 ? "rgba(217,119,6,0.2)" : "rgba(120,113,108,0.12)" } : {}}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              />
            ))}
          </div>
          <div style={{ width: "100%", height: "4rem", backgroundColor: "rgba(120,113,108,0.08)", borderRadius: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
              style={{ width: "2px", height: "1.5rem", backgroundColor: "#d97706" }}
              animate={{ opacity: [1, 0] }} transition={{ duration: 0.7, repeat: Infinity }}
            />
          </div>
        </motion.div>
        <motion.div
          style={{ marginTop: "4vh", textAlign: "center" }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 3rem)", color: "#fafaf9" }}>They mean to. </span>
          <motion.span
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.5rem, 4vw, 3rem)", color: "#78716c" }}
            animate={phase >= 3 ? { color: "#d97706" } : {}} transition={{ duration: 0.6 }}
          >
            They never do.
          </motion.span>
        </motion.div>
        <motion.p
          style={{ color: "#78716c", fontSize: "clamp(0.7rem, 1.3vw, 1rem)", marginTop: "2vh", fontFamily: "Inter, sans-serif" }}
          initial={{ opacity: 0 }} animate={phase >= 4 ? { opacity: 1 } : {}} transition={{ duration: 0.8 }}
        >
          72% say they would — only 8% actually do
        </motion.p>
      </div>
    </motion.div>
  );
}

// ── Scene 3: Solution ─────────────────────────────────────────────────────────
function Scene3() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [400, 1800, 4000, 6500].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div
      className="absolute inset-0 flex items-center overflow-hidden"
      style={{ backgroundColor: "#1c1917", paddingLeft: "8vw", paddingRight: "8vw" }}
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={{ width: "50%" }}>
        {["Scan.", "Speak.", "Done."].map((word, i) => (
          <motion.div
            key={i}
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2rem, 6.5vw, 5.5rem)", fontWeight: 700, color: i === 2 ? "#d97706" : "#fafaf9", lineHeight: 1.05 }}
            initial={{ opacity: 0, x: -40 }}
            animate={phase >= i + 1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.div>
        ))}
        <motion.p
          style={{ color: "#78716c", fontSize: "clamp(0.7rem, 1.3vw, 1rem)", fontFamily: "Inter, sans-serif", lineHeight: 1.6, marginTop: "2vh" }}
          initial={{ opacity: 0 }} animate={phase >= 4 ? { opacity: 1 } : {}}
        >
          No app. No login. Just a QR on your counter and 15 seconds of their time.
        </motion.p>
      </div>
      <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
        <motion.div
          style={{ width: "min(22vw, 220px)", height: "min(44vw, 440px)", border: "3px solid rgba(120,113,108,0.3)", borderRadius: "min(3.5vw, 2rem)", backgroundColor: "#111", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "12%", paddingLeft: "1.5rem", paddingRight: "1.5rem", position: "relative", overflow: "hidden" }}
          initial={{ y: 60, opacity: 0 }}
          animate={phase >= 1 ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ position: "absolute", top: "2.5%", width: "30%", height: "4px", backgroundColor: "rgba(120,113,108,0.3)", borderRadius: "10px" }} />
          <motion.div style={{ textAlign: "center", marginBottom: "8%" }} initial={{ opacity: 0 }} animate={phase >= 1 ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}>
            <div style={{ color: "#d97706", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(0.7rem, 1.2vw, 1rem)" }}>Revvue</div>
            <div style={{ color: "rgba(250,250,249,0.4)", fontSize: "clamp(0.55rem, 0.8vw, 0.75rem)", fontFamily: "Inter, sans-serif", marginTop: "4px" }}>{"Mario's Pizzeria"}</div>
          </motion.div>
          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "8%" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.div
                key={s}
                style={{ width: "min(2.2vw, 22px)", height: "min(2.2vw, 22px)", backgroundColor: "#d97706", borderRadius: "3px", transform: "rotate(45deg)" }}
                initial={{ scale: 0 }} animate={phase >= 2 ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: s * 0.07 }}
              />
            ))}
          </div>
          <motion.div
            style={{ width: "min(8vw, 80px)", height: "min(8vw, 80px)", borderRadius: "50%", border: "2px solid rgba(217,119,6,0.4)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
            initial={{ scale: 0 }} animate={phase >= 2 ? { scale: 1 } : {}} transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
          >
            <motion.div
              style={{ width: "70%", height: "70%", borderRadius: "50%", backgroundColor: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}
              animate={phase >= 3 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="white">
                <path d="M12 14a2 2 0 0 0 2-2V5a2 2 0 0 0-4 0v7a2 2 0 0 0 2 2zm6-2a6 6 0 0 1-12 0H4a8 8 0 0 0 16 0h-2z" />
              </svg>
            </motion.div>
            {phase >= 3 && [0, 1, 2].map((i) => (
              <motion.div
                key={i} className="absolute"
                style={{ width: "100%", height: "100%", borderRadius: "50%", border: "2px solid rgba(217,119,6,0.3)" }}
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Scene 4: Magic ────────────────────────────────────────────────────────────
function Scene4() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [800, 2800, 4800, 6500].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#1c1917" }}
      initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
    >
      <motion.div
        style={{ color: "#78716c", fontSize: "clamp(0.6rem, 1.2vw, 1rem)", fontFamily: "Inter, sans-serif", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "3vh" }}
        initial={{ opacity: 0 }} animate={phase >= 1 ? { opacity: 1 } : {}}
      >
        Voice input captured
      </motion.div>
      <div style={{ width: "65vw", maxWidth: "700px", height: "12vh", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35vw", marginBottom: "4vh" }}>
        {Array.from({ length: 36 }, (_, i) => {
          const h = 20 + Math.sin(i * 0.8) * 55 + Math.cos(i * 0.3) * 25;
          return (
            <motion.div
              key={i}
              style={{ width: "min(1.2vw, 10px)", borderRadius: "2px", backgroundColor: "#d97706" }}
              initial={{ height: "8%", opacity: 0.3 }}
              animate={
                phase === 0 ? { height: "8%", opacity: 0.3 }
                : phase === 1 ? { height: [h + "%", (h * 0.6) + "%", (h * 1.1) + "%"], opacity: 0.9 }
                : { height: "3px", backgroundColor: "#78716c", opacity: 0.4 }
              }
              transition={
                phase === 1
                  ? { duration: 0.4 + (i % 4) * 0.1, repeat: Infinity, repeatType: "reverse" as const, delay: i * 0.02 }
                  : { duration: 0.6, delay: i * 0.01 }
              }
            />
          );
        })}
      </div>
      <motion.div
        style={{ width: "min(55vw, 580px)", border: "1px solid rgba(217,119,6,0.3)", backgroundColor: "rgba(217,119,6,0.04)", borderRadius: "1.5rem", padding: "2.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}
        initial={{ opacity: 0, y: 30 }} animate={phase >= 2 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "3px", backgroundColor: "#d97706", originY: 0 }}
          initial={{ scaleY: 0 }} animate={phase >= 2 ? { scaleY: 1 } : {}} transition={{ duration: 0.5 }}
        />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(0.85rem, 1.6vw, 1.2rem)", color: "#fafaf9", lineHeight: 1.7 }}>
          &ldquo;Absolutely incredible service. The team went above and beyond every expectation. The attention to detail was remarkable — I&apos;ll definitely be back.&rdquo;
        </p>
      </motion.div>
      <motion.p
        style={{ color: "#fafaf9", fontSize: "clamp(1rem, 2.5vw, 2rem)", fontFamily: "'Playfair Display', Georgia, serif", marginTop: "3vh" }}
        initial={{ opacity: 0 }} animate={phase >= 4 ? { opacity: 1 } : {}}
      >
        15 seconds of voice. A perfect Google review.
      </motion.p>
    </motion.div>
  );
}

// ── Scene 5: Result ───────────────────────────────────────────────────────────
function Scene5() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [400, 1800, 3500, 5800].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#fafaf9" }}
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={{ width: "min(80vw, 800px)", display: "flex", alignItems: "center", gap: "6vw" }}>
        <div style={{ flex: 1 }}>
          <motion.div
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(4rem, 14vw, 10rem)", fontWeight: 700, color: "#d97706", lineHeight: 1 }}
            initial={{ opacity: 0, scale: 0.5 }} animate={phase >= 1 ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            4.9
          </motion.div>
          <motion.div
            style={{ display: "flex", gap: "0.5rem", marginTop: "1.5vh" }}
            initial={{ opacity: 0 }} animate={phase >= 1 ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                style={{ width: "clamp(1rem, 2.5vw, 2rem)", height: "clamp(1rem, 2.5vw, 2rem)", backgroundColor: "#d97706", borderRadius: "4px", transform: "rotate(45deg)" }}
                initial={{ scale: 0 }} animate={phase >= 1 ? { scale: 1 } : {}}
                transition={{ type: "spring", delay: 0.5 + i * 0.07, stiffness: 400, damping: 20 }}
              />
            ))}
          </motion.div>
          <motion.div
            style={{ color: "#78716c", fontSize: "clamp(0.65rem, 1.2vw, 0.95rem)", fontFamily: "Inter, sans-serif", marginTop: "1vh" }}
            initial={{ opacity: 0 }} animate={phase >= 2 ? { opacity: 1 } : {}}
          >
            Average Google rating after Revvue
          </motion.div>
        </div>
        <div style={{ width: "1px", height: "30vh", backgroundColor: "rgba(28,25,23,0.1)" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          {[{ v: "3×", l: "More reviews" }, { v: "+40%", l: "More customers" }, { v: "0", l: "Effort required" }].map((s, i) => (
            <motion.div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "1.5vw" }}
              initial={{ opacity: 0, x: 30 }} animate={phase >= 2 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
            >
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1.5rem, 4.5vw, 3.5rem)", fontWeight: 700, color: "#d97706", minWidth: "5vw" }}>{s.v}</span>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(1rem, 2.5vw, 2rem)", color: "#1c1917" }}>{s.l}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        style={{ position: "absolute", bottom: "4vh", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1c1917", color: "#fafaf9", fontFamily: "Inter, sans-serif", fontSize: "clamp(0.65rem, 1.1vw, 0.9rem)", padding: "0.8rem 1.8rem", borderRadius: "100px", whiteSpace: "nowrap" }}
        initial={{ opacity: 0, y: 20 }} animate={phase >= 4 ? { opacity: 1, y: 0 } : {}}
      >
        Works for restaurants, salons, gyms, clinics & more
      </motion.div>
    </motion.div>
  );
}

// ── Scene 6: Close ────────────────────────────────────────────────────────────
function Scene6() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [400, 1600, 3000, 4800].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#1c1917" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i} className="absolute"
            style={{ width: (30 + i * 20) + "vw", height: (30 + i * 20) + "vw", borderRadius: "50%", border: `1px solid rgba(217,119,6,${0.06 - i * 0.01})`, left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
            animate={{ scale: [1, 1.02, 1], rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ scale: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 18 + i * 5, repeat: Infinity, ease: "linear" } }}
          />
        ))}
      </div>
      <motion.div
        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(3rem, 10vw, 8rem)", fontWeight: 700, color: "#fafaf9", letterSpacing: "-0.02em", lineHeight: 1 }}
        initial={{ scale: 0.85, opacity: 0, filter: "blur(12px)" }}
        animate={phase >= 1 ? { scale: 1, opacity: 1, filter: "blur(0px)" } : {}}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        Revvue<motion.span style={{ color: "#d97706" }} animate={phase >= 2 ? { opacity: [1, 0.6, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}>.</motion.span>
      </motion.div>
      <motion.div
        style={{ height: "2px", backgroundColor: "#d97706", marginTop: "2.5vh", originX: 0, width: "min(35vw, 320px)" }}
        initial={{ scaleX: 0 }} animate={phase >= 2 ? { scaleX: 1 } : {}} transition={{ duration: 1, delay: 0.2 }}
      />
      <motion.p
        style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(0.75rem, 1.8vw, 1.4rem)", color: "#78716c", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "2.5vh" }}
        initial={{ opacity: 0, y: 15 }} animate={phase >= 2 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay: 0.3 }}
      >
        The review they&apos;ll actually leave
      </motion.p>
      <motion.div
        style={{ marginTop: "5vh", display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}
        initial={{ opacity: 0 }} animate={phase >= 3 ? { opacity: 1 } : {}}
      >
        <Link
          href="/demo"
          style={{ backgroundColor: "#d97706", color: "#1c1917", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "clamp(0.75rem, 1.2vw, 1rem)", padding: "0.8rem 2rem", borderRadius: "100px", textDecoration: "none" }}
        >
          Try it free →
        </Link>
        <Link
          href="/signup"
          style={{ color: "#78716c", fontSize: "clamp(0.7rem, 1.1vw, 0.9rem)", fontFamily: "Inter, sans-serif", textDecoration: "none" }}
        >
          Start your free trial
        </Link>
      </motion.div>
      <motion.div
        style={{ position: "absolute", bottom: "3vh", color: "rgba(120,113,108,0.35)", fontSize: "clamp(0.55rem, 0.9vw, 0.75rem)", fontFamily: "Inter, sans-serif", letterSpacing: "0.15em" }}
        initial={{ opacity: 0 }} animate={phase >= 4 ? { opacity: 1 } : {}}
      >
        Built for the Replit 10-Year Buildathon · revvue.live
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VideoPage() {
  const scene = useVideoPlayer();
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1c1917", position: "relative" }}>
      <Link
        href="/"
        style={{ position: "absolute", top: "1.5rem", left: "1.5rem", zIndex: 50, color: "rgba(120,113,108,0.6)", fontFamily: "Inter, sans-serif", fontSize: "0.8rem", textDecoration: "none", letterSpacing: "0.1em" }}
      >
        ← revvue.live
      </Link>

      <motion.div
        style={{ position: "absolute", height: "1px", backgroundColor: "#d97706", left: 0, zIndex: 10, opacity: scene === 4 ? 0 : 0.4 }}
        animate={{
          width: (["0%", "30%", "50%", "70%", "100%", "0%"] as const)[scene] ?? "0%",
          top: (["50%", "30%", "70%", "40%", "60%", "50%"] as const)[scene] ?? "50%",
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <AnimatePresence initial={false} mode="popLayout">
        {scene === 0 && <Scene1 key="s1" />}
        {scene === 1 && <Scene2 key="s2" />}
        {scene === 2 && <Scene3 key="s3" />}
        {scene === 3 && <Scene4 key="s4" />}
        {scene === 4 && <Scene5 key="s5" />}
        {scene === 5 && <Scene6 key="s6" />}
      </AnimatePresence>

      <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.5rem", zIndex: 50 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: i === scene ? "#d97706" : "rgba(120,113,108,0.4)", transition: "background-color 0.3s" }}
          />
        ))}
      </div>
    </div>
  );
}
