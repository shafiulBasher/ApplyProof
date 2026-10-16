// Hand-drawn-style line art (inline SVG, no image downloads). All decorative: aria-hidden.
import type { SVGProps } from "react";

const INK = "#302B40";
type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({ fill: "none", stroke: INK, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false, ...p });

// A slight wobble so straight lines look drawn by hand.
function Wobble({ id }: { id: string }) {
  return (
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" />
      <feDisplacementMap in="SourceGraphic" scale="2.2" />
    </filter>
  );
}

export function Sparkle(p: P) {
  return (
    <svg viewBox="0 0 24 24" {...base(p)} strokeWidth={1.6}>
      <path d="M12 2.5c.6 4.6 2.3 7.6 9 9.5-6.7 1.9-8.4 4.9-9 9.5-.6-4.6-2.3-7.6-9-9.5 6.7-1.9 8.4-4.9 9-9.5Z" fill="#FAE9B9" />
    </svg>
  );
}

export function PaperPlane(p: P) {
  return (
    <svg viewBox="0 0 48 32" {...base(p)} strokeWidth={1.6}>
      <path d="M2 14 46 2 30 30l-8-10L2 14Z" fill="#C9B8F5" />
      <path d="M46 2 22 20l-2 9 2-9" />
      <path d="m22 20 8 10" />
    </svg>
  );
}

export function PaperClip(p: P) {
  return (
    <svg viewBox="0 0 20 48" {...base(p)} strokeWidth={1.8} stroke="#9a92b3">
      <path d="M14 14v22a6 6 0 0 1-12 0V9a4 4 0 0 1 8 0v25a2 2 0 0 1-4 0V14" />
    </svg>
  );
}

export function DottedPath(p: P & { d?: string }) {
  const { d = "M4 60 C 60 10, 120 70, 196 14", ...rest } = p;
  return (
    <svg viewBox="0 0 200 72" {...base(rest)} strokeWidth={1.6} strokeDasharray="2 6" stroke="#7861CF">
      <path d={d} />
    </svg>
  );
}

// Three university sketches so cards look different from each other.
export function University({ variant = 0, ...p }: P & { variant?: number }) {
  const id = `wob-u${variant}`;
  const v = ((variant % 3) + 3) % 3;
  return (
    <svg viewBox="0 0 220 120" {...base(p)} strokeWidth={1.5}>
      <defs><Wobble id={id} /></defs>
      <g filter={`url(#${id})`}>
        <path d="M6 112h208" />
        {v === 0 && (
          <>
            <path d="M70 46c0-22 80-22 80 0" fill="#EAE2FF" />
            <path d="M110 24v-10m0 0 8 3-8 3" />
            <path d="M56 46h108v8H56z" fill="#fff" />
            {[64, 82, 100, 118, 136, 154].map((x) => <path key={x} d={`M${x} 54v46`} />)}
            <path d="M52 100h116v12H52z" fill="#FAE9B9" />
            <path d="M24 112V74h28v38M168 112V74h28v38" fill="#fff" />
            <path d="M30 84h6v8h-6zM40 84h6v8h-6zM174 84h6v8h-6zM184 84h6v8h-6z" />
            <path d="M102 112V86a8 8 0 0 1 16 0v26" fill="#EAE2FF" />
          </>
        )}
        {v === 1 && (
          <>
            <path d="M40 112V48l14-22 14 22v64" fill="#EAE2FF" />
            <path d="M152 112V48l14-22 14 22v64" fill="#EAE2FF" />
            <path d="M68 112V64h84v48" fill="#fff" />
            <path d="M68 64l42-26 42 26" fill="#FAE9B9" />
            <circle cx="110" cy="54" r="7" fill="#fff" />
            <path d="M110 50v4l3 2" />
            <path d="M80 76h10v14H80zM130 76h10v14h-10zM48 60h12v12H48zM160 60h12v12h-12z" />
            <path d="M100 112V92a10 10 0 0 1 20 0v20" fill="#EAE2FF" />
          </>
        )}
        {v === 2 && (
          <>
            <path d="M76 112V70h68v42" fill="#fff" />
            <path d="M64 70h92l-14-14H78z" fill="#EAE2FF" />
            <path d="M84 56V42h52v14" fill="#fff" />
            <path d="M74 42h72l-12-12H86z" fill="#FAE9B9" />
            <path d="M96 30V20h28v10M110 20V8" />
            <path d="M88 82h10v12H88zM122 82h10v12h-10z" />
            <path d="M104 112V94a6 6 0 0 1 12 0v18" fill="#EAE2FF" />
            <path d="M20 112c4-26 22-26 26 0M178 112c4-20 18-20 22 0" fill="#DDEBDD" />
          </>
        )}
        <path d="M14 32l2 4 4 1-4 2-1 4-2-4-4-1 4-2z" fill="#FAE9B9" />
      </g>
    </svg>
  );
}

// Lilac paper plane with a looping hand-drawn trail. Pass trailClass to animate the trail drawing in.
export function LoopPlane({ trailClass = "", planeClass = "", ...p }: P & { trailClass?: string; planeClass?: string }) {
  return (
    <svg viewBox="0 0 320 160" {...base(p)} strokeWidth={2.2}>
      <path
        d="M6 120c40 8 70-2 92-18 20-15 10-38-6-30-18 9-4 40 26 38 34-2 52-30 78-44 22-12 50-14 70-10"
        pathLength="1"
        strokeDasharray="1"
        className={trailClass}
      />
      <g className={planeClass} strokeWidth={2}>
        <path d="M262 60 316 18 296 88 278 72 262 60Z" fill="#C9B8F5" />
        <path d="M316 18 278 72l-4 22 4-22" fill="#A893EA" />
        <path d="M316 18 262 60l16 12" />
        <path d="M268 64l-6-4M300 40l-8 6" strokeWidth={1.2} />
      </g>
    </svg>
  );
}

// Empty-state notebook with a paper clip.
export function Notebook(p: P) {
  return (
    <svg viewBox="0 0 160 120" {...base(p)} strokeWidth={1.6}>
      <defs><Wobble id="wob-nb" /></defs>
      <g filter="url(#wob-nb)">
        <path d="M24 16h104a6 6 0 0 1 6 6v86H24z" fill="#fff" />
        {[36, 50, 64, 78, 92].map((y) => <path key={y} d={`M38 ${y}h82`} stroke="#9a92b3" strokeWidth={1} />)}
        <path d="M24 16v92" stroke="#F4D8D0" strokeWidth={3} />
        <path d="M110 6v24a6 6 0 0 1-12 0V12a4 4 0 0 1 8 0v16" stroke="#9a92b3" />
        <path d="M44 52l6 6 12-14" stroke="#5fae86" strokeWidth={2.2} />
      </g>
    </svg>
  );
}
