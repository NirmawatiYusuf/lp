"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, MotionConfig, useScroll, useSpring } from "motion/react";

export function PublicShell({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  const area = pathname.startsWith("/writing") ? "writing" : pathname.startsWith("/projects") ? "projects" : "home";

  useEffect(() => {
    document.documentElement.dataset.area = area;
    return () => { delete document.documentElement.dataset.area; };
  }, [area]);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 28, mass: 0.3 });

  return (
    <MotionConfig reducedMotion="user">
        <div className="site-frame" data-area={area} id="top">
          <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
          {header}
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <p>Raihan Daris Ramadhan</p>
            <p>Dirancang dan dibangun secara independen · 2026</p>
            <div className="footer-links"><a href="#top">Kembali ke atas ↑</a></div>
          </footer>
        </div>
    </MotionConfig>
  );
}
