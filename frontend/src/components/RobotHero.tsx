'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';

// Load the (heavy) Lottie player only when there's actually an animation to
// render — until `public/robot.json` exists, the SVG fallback shows and the
// player is never downloaded, keeping the landing page light.
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

/**
 * Landing-hero "agent bot" centerpiece.
 *
 * Tells the Synapse story in one glance: a living AI agent at the center of a
 * small network. If `public/robot.json` (a Lottie animation) exists it plays
 * that; otherwise it falls back to a self-contained animated SVG robot, so the
 * hero is never empty. Both respect prefers-reduced-motion.
 *
 * To use a real Lottie: drop a robot animation JSON at `public/robot.json`
 * (download "Lottie JSON" from lottiefiles.com — search "AI robot assistant").
 */
export function RobotHero() {
  const reduce = useReducedMotion();
  const [lottieData, setLottieData] = useState<unknown | null>(null);
  const [triedLottie, setTriedLottie] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/robot.json', { cache: 'force-cache' });
        if (!res.ok) throw new Error('no lottie');
        const ct = res.headers.get('content-type') || '';
        // Next serves a fallback HTML 200 for missing public files sometimes;
        // guard against parsing that as JSON.
        if (!ct.includes('json') && !ct.includes('text/plain')) throw new Error('not json');
        const json = await res.json();
        if (!cancelled) setLottieData(json);
      } catch {
        /* fall back to the SVG robot */
      } finally {
        if (!cancelled) setTriedLottie(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative mx-auto mb-8 h-48 w-48 md:h-56 md:w-56">
      {/* Caramel glow aura */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#ffb640]/20 blur-3xl" />

      {lottieData ? (
        <Lottie
          animationData={lottieData}
          loop
          autoplay={!reduce}
          className="h-full w-full"
        />
      ) : (
        triedLottie && <SvgRobot reduce={!!reduce} />
      )}
    </div>
  );
}

/** Self-contained animated SVG robot — the no-asset fallback. */
function SvgRobot({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="flex h-full w-full items-center justify-center"
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Orbiting agent-type nodes */}
      {!reduce && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 90, 180, 270].map((deg, i) => {
            const colors = ['#ff9f1c', '#ffd166', '#fff0a8', '#d77a12'];
            return (
              <span
                key={deg}
                className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full"
                style={{
                  backgroundColor: colors[i],
                  transform: `rotate(${deg}deg) translateY(-92px)`,
                  boxShadow: `0 0 10px ${colors[i]}`,
                }}
              />
            );
          })}
        </motion.div>
      )}

      <svg viewBox="0 0 120 120" className="relative h-40 w-40 md:h-48 md:w-48" fill="none">
        <defs>
          <linearGradient id="robotBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff0a8" />
            <stop offset="45%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#ff9f1c" />
          </linearGradient>
          <radialGradient id="robotCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7df" />
            <stop offset="100%" stopColor="#ff9f1c" />
          </radialGradient>
        </defs>

        {/* Antenna */}
        <line x1="60" y1="20" x2="60" y2="32" stroke="#76501d" strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="60"
          cy="16"
          r="5"
          fill="url(#robotCore)"
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5], r: [4.5, 5.5, 4.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Head */}
        <rect x="34" y="32" width="52" height="42" rx="14" fill="url(#robotBody)" stroke="#d77a12" strokeWidth="2" />

        {/* Eyes (blink via scaleY) */}
        <motion.g
          animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1], ease: 'easeInOut' }}
          style={{ transformOrigin: '60px 50px' }}
        >
          <circle cx="49" cy="50" r="6" fill="#211100" />
          <circle cx="71" cy="50" r="6" fill="#211100" />
          <circle cx="51" cy="48" r="2" fill="#fff7df" />
          <circle cx="73" cy="48" r="2" fill="#fff7df" />
        </motion.g>

        {/* Mouth */}
        <rect x="50" y="62" width="20" height="4" rx="2" fill="#211100" opacity="0.6" />

        {/* Body */}
        <rect x="40" y="78" width="40" height="30" rx="10" fill="url(#robotBody)" stroke="#d77a12" strokeWidth="2" />

        {/* Chest core (pulses) */}
        <motion.circle
          cx="60"
          cy="93"
          r="7"
          fill="url(#robotCore)"
          animate={reduce ? undefined : { opacity: [0.6, 1, 0.6], r: [6, 8, 6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Arms */}
        <rect x="26" y="80" width="10" height="22" rx="5" fill="url(#robotBody)" stroke="#d77a12" strokeWidth="2" />
        <rect x="84" y="80" width="10" height="22" rx="5" fill="url(#robotBody)" stroke="#d77a12" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}
