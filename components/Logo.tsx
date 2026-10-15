import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-linear-to-br from-violet to-mint text-white">
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </span>
      ApplyProof
    </Link>
  );
}
