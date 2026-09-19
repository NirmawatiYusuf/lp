"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate, useInView, useReducedMotion } from "motion/react";

export function Reveal({ children, className, delay = 0, amount = 0.16 }: { children: React.ReactNode; className?: string; delay?: number; amount?: number }) {
  const [scope, animate] = useAnimate();
  const inView = useInView(scope, { once: true, amount });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (inView && !reducedMotion) {
      void animate(scope.current, { opacity: [0, 1], y: [18, 0] }, { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] });
    }
  }, [animate, delay, inView, reducedMotion, scope]);

  return <div ref={scope} className={className}>{children}</div>;
}

export function HeroHeadline() {
  const [scope, animate] = useAnimate();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!reducedMotion) {
      void animate("span > span", { y: ["100%", "0%"] }, { duration: 0.7, delay: stagger(0.08), ease: [0.22, 1, 0.36, 1] });
    }
  }, [animate, reducedMotion]);

  const lines = ["Merancang sistem", "digital yang jelas,", "tangguh, dan bernilai."];
  return <h1 ref={scope} className="animated-headline" aria-label={lines.join(" ")}>{lines.map((line, index) => <span className={index === 2 ? "accent-line" : ""} key={line}><span>{line}</span></span>)}</h1>;
}

export function HeroArtwork() {
  const reducedMotion = useReducedMotion();
  return <div className="hero-art" aria-label="Profil singkat Raihan">
    <div className="art-grid" aria-hidden="true" />
    <div className="art-orbit orbit-one" aria-hidden="true" />
    <motion.div className="art-orbit orbit-two" aria-hidden="true" animate={{ rotate: reducedMotion ? 0 : -360 }} transition={{ duration: 48, repeat: reducedMotion ? 0 : Infinity, ease: "linear" }} />
    <div className="art-monogram" aria-hidden="true">R</div>
    <div className="art-label art-label-top"><span className="status-dot" /> Terbuka untuk kolaborasi</div>
    <div className="art-label art-label-bottom"><small>Fokus utama</small><strong>Web · Data · Systems</strong></div>
    <span className="art-coordinate">06°12&apos;S / 106°49&apos;E</span>
  </div>;
}
