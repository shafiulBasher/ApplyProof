import Link from "next/link";

// The ApplyProof mark: stacked application papers with a verified check.
export function LogoMark({ className = "h-8 w-8", checkStyle }: { className?: string; checkStyle?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden focusable="false">
      <rect x="6" y="9" width="26" height="33" rx="4" fill="#C9B8F5" transform="rotate(-9 19 25)" />
      <rect x="8" y="7" width="26" height="33" rx="4" fill="#E2D8FF" transform="rotate(-4 21 23)" />
      <path d="M14 5h15l9 9v25a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" fill="#FFF8EC" stroke="#7861CF" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M29 5v6a3 3 0 0 0 3 3h6" fill="#C9B8F5" stroke="#7861CF" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16 18h11M16 23.5h14M16 29h9" stroke="#A893EA" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="34" cy="34" r="10.5" fill="#5FA884" stroke="#fff" strokeWidth="2.2" />
      <path d="M29.2 34.4l3.3 3.3 6.4-7" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={checkStyle} />
      <path d="M42.5 19.5l2.6-2.2M44 25h3.2" stroke="#7861CF" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-tight text-ink ${className}`}>
      Apply<span className="text-primary">Proof</span>
    </span>
  );
}

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-xl" aria-label="ApplyProof home">
      <LogoMark className="h-8 w-8 drop-shadow-[0_3px_6px_rgba(120,97,207,0.25)]" />
      <Wordmark />
    </Link>
  );
}
