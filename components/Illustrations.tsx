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
      <path d="M2 14 46 2 30 30l-8-10L2 14Z" fill="#fff" />
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

// Landing hero: a desk under a window with a university skyline and a plane on a dotted path.
export function DeskScene(p: P) {
  return (
    <svg viewBox="0 0 520 330" {...base(p)} strokeWidth={1.6}>
      <defs><Wobble id="wob-desk" /></defs>
      <g filter="url(#wob-desk)">
        <rect x="70" y="24" width="380" height="220" rx="18" fill="#EAE2FF" />
        <path d="M260 24v220M70 134h380" stroke="#fff" strokeWidth={6} />
        <path d="M96 244V186l16-24 16 24v58M330 244V172c0-26 70-26 70 0v72" fill="#fff" />
        <path d="M140 244v-40h70v40M150 214h10v12h-10zM190 214h10v12h-10z" fill="#FAE9B9" />
        <path d="M352 196h26M352 212h26" />
        <path d="M120 88c40-46 140-58 240-18" strokeDasharray="2 7" stroke="#7861CF" />
        <path d="M356 64l26-8-8 26-6-7-12-11z" fill="#fff" />
        <circle cx="410" cy="62" r="14" fill="#FAE9B9" />
        <path d="M30 262h460" strokeWidth={2} />
        <path d="M40 262l-6 60M480 262l6 60" />
        <path d="M150 256c30-14 80-14 110 0 30-14 80-14 110 0v-48c-30-14-80-14-110 0-30-14-80-14-110 0z" fill="#fff" />
        <path d="M260 208v48" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M168 ${222 + i * 8}h70M282 ${222 + i * 8}h${i === 3 ? 40 : 70}`} stroke="#9a92b3" strokeWidth={1} />)}
        <path d="M296 230l6 6 12-14" stroke="#5fae86" strokeWidth={2.2} />
        <path d="M56 256h70v-14H56zM62 242h60v-12H62zM58 230h66v-12H58z" fill="#FAE9B9" />
        <path d="M418 256c-6-20 30-20 24 0" fill="#fff" />
        <path d="M430 236v-46l-22-10M408 180l-18 22h36z" fill="#F4D8D0" />
        <path d="M394 256h52" />
        <path d="M458 252v-26h22v26c0 4-22 4-22 0z" fill="#BFE8DE" />
        <path d="M480 232c8 0 8 12 0 12" />
      </g>
      <g fill="#FAE9B9">
        <path d="M60 60l2 5 5 1-5 2-2 5-2-5-5-2 5-1z" />
        <path d="M470 120l3 7 7 2-7 3-3 7-3-7-7-3 7-2z" />
        <path d="M230 300l2 5 5 1-5 2-2 5-2-5-5-2 5-1z" />
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
