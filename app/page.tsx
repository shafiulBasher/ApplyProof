import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardList, FileSearch, FileUp, Lock, Quote, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import Logo from "@/components/Logo";
import Intro from "@/components/Intro";
import { LoopPlane, Sparkle } from "@/components/Illustrations";

const BADGES = [
  { icon: Lock, text: "Your files stay on your device" },
  { icon: Quote, text: "Clear, evidence-based results" },
  { icon: Sprout, text: "Free to use (no paid APIs)" },
];

const STEPS = [
  { icon: FileSearch, title: "Add the official guideline", text: "Upload the PDF, or paste the requirements straight from the program's or employer's website." },
  { icon: ClipboardList, title: "See what's required", text: "A checklist of required documents appears right away, with page and word limits." },
  { icon: FileUp, title: "Upload your documents", text: "Your CV, letters, and transcript are read on your own computer. They never leave it." },
  { icon: Sparkles, title: "Fix with evidence", text: "Every finding quotes the guideline. Fix a file, rerun, and see exactly what changed." },
];

export default function Landing() {
  return (
    <>
      <Intro />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="flex items-center justify-between gap-4 py-6">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-3">
            <a href="#how" className="btn-ghost hidden sm:inline-flex">How it works</a>
            <a href="#trust" className="btn-ghost hidden sm:inline-flex">Privacy</a>
            <Link href="/applications" className="btn-primary">Get started</Link>
          </nav>
        </header>

        <section className="relative grid items-center gap-12 py-8 md:grid-cols-[1fr_1.05fr] md:py-14">
          <Sparkle className="absolute -left-2 top-6 hidden h-7 w-7 animate-[twinkle_3s_ease-in-out_infinite] md:block" />
          <div className="animate-[fade-up_800ms_cubic-bezier(.22,1,.36,1)_both]">
            <p className="hand-note text-3xl text-primary-ink">A bigger chapter awaits…</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.02] sm:text-7xl">
              Apply with
              <span className="relative block w-fit">
                <em className="font-display italic text-primary">confidence</em>
                <svg viewBox="0 0 300 16" className="absolute -bottom-3 left-0 h-4 w-full" fill="none" stroke="#FAE9B9" strokeWidth="9" strokeLinecap="round" aria-hidden>
                  <path d="M6 10c80-8 190-9 288-3" />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-md text-lg text-muted">
              Turn scholarship and job requirements into a clear, source-linked checklist, and know what&apos;s missing before you submit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/applications" className="btn-primary px-6 py-3.5 text-base">Get started <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="btn-secondary px-6 py-3.5 text-base">See how it works</a>
            </div>
            <ul className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {BADGES.map((b) => (
                <li key={b.text} className="flex items-center gap-2 text-xs leading-snug text-muted">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lilac text-primary-ink"><b.icon className="h-4 w-4" aria-hidden /></span>
                  {b.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] animate-[fade-up_1000ms_cubic-bezier(.22,1,.36,1)_150ms_both]">
            {/* Scrapbook photo: white border, washi tape, slight tilt. */}
            <div className="relative rotate-[1.5deg] rounded-[26px] bg-white p-3 shadow-[0_30px_60px_-28px_rgba(48,43,64,0.5)] transition duration-500 hover:rotate-0">
              <Image
                src="/illustrations/hero-student.webp"
                alt="A student in a purple hoodie smiling up at a university, with a plane flying overhead"
                width={776}
                height={928}
                priority
                sizes="(min-width: 768px) 520px, 100vw"
                className="h-auto w-full rounded-[18px]"
              />
              <span className="absolute -top-3 left-10 h-7 w-28 -rotate-6 rounded-sm bg-lilac/80 shadow-sm" aria-hidden />
              <span className="absolute -bottom-3 right-12 h-7 w-24 rotate-3 rounded-sm bg-butter/90 shadow-sm" aria-hidden />
            </div>
            <LoopPlane className="pointer-events-none absolute -left-16 -top-8 hidden h-28 w-56 animate-[float_6s_ease-in-out_infinite] lg:block" />
            <div className="absolute -bottom-8 -left-6 hidden -rotate-6 rounded-md bg-butter px-4 py-3 shadow-[0_10px_20px_-12px_rgba(48,43,64,0.5)] sm:block" aria-hidden>
              <p className="font-hand text-xl leading-tight text-ink">Plan · Prepare<br />Apply · Grow ✦</p>
            </div>
            <Sparkle className="absolute -right-3 top-1/3 h-7 w-7 animate-[twinkle_3.5s_ease-in-out_infinite]" />
          </div>
        </section>

        <section id="how" className="scroll-mt-8 py-14">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Four calm steps to <em className="italic text-primary">ready</em></h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card relative p-5">
                <span className="hand-note absolute right-4 top-3 text-3xl text-primary/40">{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lilac text-primary-ink"><s.icon className="h-5 w-5" aria-hidden /></span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="trust" className="grid scroll-mt-8 gap-4 py-10 md:grid-cols-2">
          <div className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage text-sage-ink"><ShieldCheck className="h-5 w-5" aria-hidden /></span>
            <h3 className="mt-4 font-display text-xl font-semibold">What stays private</h3>
            <p className="mt-2 text-sm text-muted">
              Only the official guideline&apos;s text is sent to Google&apos;s Gemini to list its requirements, and only after you agree. On the free tier, Google may use it to improve its products. Your CV, letters, transcripts, and details are read on your own computer and stored in your browser.
            </p>
          </div>
          <div className="card p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-butter text-butter-ink"><Quote className="h-5 w-5" aria-hidden /></span>
            <h3 className="mt-4 font-display text-xl font-semibold">Evidence, not guesses</h3>
            <p className="mt-2 text-sm text-muted">
              Every finding shows the guideline&apos;s exact words and where they appear. Page and word counts are measured by code, not AI. If a quote can&apos;t be confirmed, the finding says <strong className="text-ink">Needs Verification</strong> instead of guessing.
            </p>
          </div>
        </section>

        <section className="card ruled relative my-14 overflow-hidden px-6 py-12 text-center">
          <h2 className="text-3xl font-semibold">Your next chapter starts here.</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">Try it with the fictional sample scholarship and job files included in the project.</p>
          <Link href="/applications" className="btn-primary mt-6 px-5 py-3 text-base">Start an application <ArrowRight className="h-4 w-4" /></Link>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-8 text-sm text-muted">
          <Logo />
          <p>ApplyProof checks readiness. It doesn&apos;t predict outcomes.</p>
        </footer>
      </div>
    </>
  );
}
