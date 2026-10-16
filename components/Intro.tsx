"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LoopPlane, Sparkle } from "./Illustrations";

const SEEN_KEY = "applyproof-intro-seen";
const EASE = "cubic-bezier(.22,1,.36,1)";

// ~7s intro in three scenes, transform/opacity only. Plays once per browser, skippable,
// never for reduced-motion users, and starts only once the artwork is ready.
export default function Intro() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    const t = setTimeout(() => setReady(true), 1500); // don't wait forever on a slow connection
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;
  return (
    <div
      className="intro fixed inset-0 z-50 grid place-items-center overflow-hidden bg-oat px-4"
      data-ready={ready}
      style={{ animation: `fade-away 700ms ${EASE} 6.5s forwards` }}
      onAnimationEnd={(e) => e.target === e.currentTarget && setShow(false)}
      role="dialog"
      aria-label="ApplyProof intro"
    >
      <button className="btn-ghost absolute right-4 top-4 z-10 border border-line bg-white" onClick={() => setShow(false)} autoFocus>
        Skip intro
      </button>

      <div className="relative aspect-[16/10] w-full max-w-[720px]">
        {/* Scene 1: a paper with a dream */}
        <div className="absolute inset-0" style={{ animation: `fade-away 600ms ${EASE} 2.7s forwards` }}>
          <div
            className="ruled absolute inset-[6%] grid place-items-center rounded-[22px] border border-line bg-[#fffaf1] shadow-[0_30px_60px_-30px_rgba(48,43,64,0.45)]"
            style={{ animation: `paper-in 1000ms ${EASE} both` }}
          >
            <div className="text-center">
              <p className="font-hand text-4xl text-ink sm:text-6xl" style={{ animation: `soft-write 1500ms ease-in-out 500ms both` }}>
                A bigger chapter awaits…
              </p>
              <LoopPlane
                className="mx-auto mt-4 h-24 w-56 sm:h-28 sm:w-64"
                trailClass="animate-[draw_1500ms_cubic-bezier(.22,1,.36,1)_1.1s_both]"
                style={{ animation: `glide 1400ms ${EASE} 1.1s both` }}
              />
            </div>
            <Sparkle className="absolute left-[10%] top-[14%] h-7 w-7" style={{ animation: `pop-in 600ms ${EASE} 1.4s both` }} />
            <Sparkle className="absolute bottom-[16%] right-[12%] h-6 w-6" style={{ animation: `pop-in 600ms ${EASE} 1.7s both` }} />
          </div>
        </div>

        {/* Scene 2: the dream behind the application */}
        <div className="absolute inset-0" style={{ animation: `fade-up 900ms ${EASE} 2.9s both, fade-away 600ms ${EASE} 5s forwards` }}>
          <div className="absolute inset-0 overflow-hidden rounded-[22px] shadow-[0_30px_60px_-30px_rgba(48,43,64,0.45)]">
            <Image
              src="/illustrations/dream-board.webp"
              alt=""
              fill
              priority
              sizes="720px"
              className="object-cover"
              style={{ animation: `ken-burns 2600ms ${EASE} 2.9s both` }}
              onLoad={() => setReady(true)}
            />
          </div>
          <p
            className="font-hand absolute inset-x-0 -bottom-12 text-center text-3xl text-ink sm:text-4xl"
            style={{ animation: `fade-up 800ms ${EASE} 3.4s both` }}
          >
            Every big dream starts somewhere…
          </p>
        </div>

        {/* Scene 3: the reveal */}
        <div className="absolute inset-0 grid place-items-center" style={{ animation: `fade-up 900ms ${EASE} 5.2s both` }}>
          <div className="ruled rounded-[22px] border border-line bg-[#fffaf1] px-10 py-12 text-center shadow-[0_30px_60px_-30px_rgba(48,43,64,0.45)] sm:px-16">
            <p className="inline-flex items-center gap-3 font-display text-5xl font-semibold text-ink sm:text-6xl">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-white" style={{ animation: `pop-in 700ms ${EASE} 5.4s both` }}>
                <svg viewBox="0 0 16 16" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3.5 8.5l3 3 6-7" pathLength="1" strokeDasharray="1" style={{ animation: `draw 600ms ${EASE} 5.8s both` }} />
                </svg>
              </span>
              ApplyProof
            </p>
            <p className="font-hand mt-3 text-3xl text-primary-ink" style={{ animation: `fade-up 700ms ${EASE} 5.8s both` }}>Turn requirements into clarity.</p>
            <svg viewBox="0 0 240 12" className="mx-auto mt-1 h-3 w-56" fill="none" stroke="#7861CF" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M4 8c50-6 120-8 232-2" pathLength="1" strokeDasharray="1" style={{ animation: `draw 700ms ${EASE} 6s both` }} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
