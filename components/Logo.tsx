import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-white shadow-[0_4px_10px_-4px_rgba(120,97,207,0.9)]">
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </span>
      ApplyProof
    </Link>
  );
}
