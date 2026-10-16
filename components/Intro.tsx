"use client";
import { useEffect, useState } from "react";
import { PaperPlane, Sparkle, University } from "./Illustrations";

const SEEN_KEY = "applyproof-intro-seen";
const FLIGHT = "path('M 10 96 C 70 20, 160 120, 290 24')";

// ~6.5s CSS/SVG intro. Plays once per browser, skippable, and never for reduced-motion users.
export default function Intro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
      localStorage.setItem(SEEN_KEY, "1");
    } catch {}
    if (!seen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShow(true);
  }, []);

  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-oat px-4 animate-[intro-out_600ms_ease-in_6.2s_forwards]"
      onAnimationEnd={(e) => e.target === e.currentTarget && setShow(false)}
      role="dialog"
      aria-label="ApplyProof intro"
    >
      <button className="btn-ghost absolute right-4 top-4 border border-line bg-white" onClick={() => setShow(false)} autoFocus>
        Skip intro
      </button>

      <div className="ruled relative w-full max-w-[560px] rounded-[20px] border border-line bg-[#fffaf1] px-6 py-10 shadow-[0_30px_60px_-30px_rgba(48,43,64,0.45)] animate-[paper-in_800ms_cubic-bezier(.2,.8,.2,1)_both]">
        {/* Scene one: the dream */}
        <div className="animate-[intro-out_400ms_ease-in_4.3s_forwards]">
          <p className="font-hand text-center text-3xl text-ink sm:text-4xl animate-[write-in_1600ms_steps(34)_700ms_both]">
            Every big dream starts somewhere…
          </p>
          <div className="relative mx-auto mt-6 h-[120px] w-[300px]">
            <University variant={0} className="absolute inset-x-6 bottom-0 animate-[pop-in_700ms_ease-out_2.3s_both]" />
            <Sparkle className="absolute left-2 top-2 h-6 w-6 animate-[pop-in_400ms_ease-out_2.6s_both]" />
            <Sparkle className="absolute right-4 top-0 h-5 w-5 animate-[pop-in_400ms_ease-out_2.8s_both]" />
            <svg viewBox="0 0 300 120" className="absolute inset-0 animate-[pop-in_300ms_ease-out_3s_both]" fill="none" aria-hidden>
              <path d="M 10 96 C 70 20, 160 120, 290 24" stroke="#7861CF" strokeWidth="1.6" strokeDasharray="2 6" strokeLinecap="round" />
            </svg>
            <div className="absolute left-0 top-0 h-6 w-9 animate-[fly_1400ms_ease-in-out_3s_both]" style={{ offsetPath: FLIGHT, offsetRotate: "auto" }}>
              <PaperPlane className="h-6 w-9" />
            </div>
          </div>
        </div>

        {/* Scene two: the reveal */}
        <div className="absolute inset-0 grid place-items-center animate-[pop-in_600ms_ease-out_4.6s_both]">
          <div className="text-center">
            <p className="inline-flex items-center gap-3 font-display text-5xl font-semibold text-ink">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white">
                <svg viewBox="0 0 16 16" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3.5 8.5l3 3 6-7" /></svg>
              </span>
              ApplyProof
            </p>
            <p className="font-hand mt-3 text-2xl text-primary-ink">Turn requirements into clarity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
