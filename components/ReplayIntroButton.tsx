"use client";
import { PlayCircle } from "lucide-react";
import { REPLAY_EVENT } from "./Intro";

// With reduced motion the intro can't animate, so jump to the written steps instead.
function replay() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.getElementById("how")?.scrollIntoView();
  else window.dispatchEvent(new Event(REPLAY_EVENT));
}

export default function ReplayIntroButton({ className = "", label = "See how it works" }: { className?: string; label?: string }) {
  return (
    <button type="button" className={className} onClick={replay}>
      <PlayCircle className="h-5 w-5" aria-hidden /> {label}
    </button>
  );
}
