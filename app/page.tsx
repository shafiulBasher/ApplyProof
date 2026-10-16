import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardList, FileSearch, FileUp, Lock, Quote, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import Logo from "@/components/Logo";
import Intro from "@/components/Intro";
import { Sparkle } from "@/components/Illustrations";
import ReplayIntroButton from "@/components/ReplayIntroButton";

const BADGES = [
  { icon: Lock, text: "Your files stay on your device" },
  { icon: Quote, text: "Clear, evidence-based results" },
  { icon: Sprout, text: "Free to use" },
];

const STEPS = [
  { icon: FileSearch, title: "Add the official guideline", text: "Upload the PDF, or paste the requirements straight from the program's or employer's website." },
  { icon: ClipboardList, title: "See what's required", text: "A checklist of required documents appears right away, with page and word limits." },
  { icon: FileUp, title: "Upload your documents", text: "Your CV, letters, and transcript are read on your own computer. They never leave it." },
  { icon: Sparkles, title: "Fix with evidence", text: "Every finding quotes the guideline. Fix a file, rerun, and see exactly what changed." },
];

function Headline({ className = "" }: { className?: string }) {
  return (
    <h1 className={`font-marker leading-[0.98] tracking-tight text-[#1d1a33] ${className}`} style={{ fontFamily: "var(--font-marker)" }}>
      Apply with
      <span className="relative block w-fit text-primary">
        Confidence
        <svg viewBox="0 0 300 14" className="absolute -bottom-[0.08em] left-[2%] -z-10 h-[0.22em] w-[96%]" fill="none" stroke="#FAE9B9" strokeWidth="10" strokeLinecap="round" aria-hidden>
          <path d="M6 9c80-7 190-8 288-2" />
        </svg>
      </span>
    </h1>
  );
}

function Badges({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-3 ${className}`}>
      {BADGES.map((b) => (
        <li key={b.text} className="flex items-center gap-[0.7em] leading-snug text-ink/80">
          <span className="grid aspect-square w-[2.9em] shrink-0 place-items-center rounded-full bg-lilac text-primary-ink"><b.icon className="h-[1.3em] w-[1.3em]" aria-hidden /></span>
          {b.text}
        </li>
      ))}
    </ul>
  );
}

const NAV = [
  { href: "#how", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#trust", label: "About" },
];

export default function Landing() {
  return (
    <>
      <Intro />

      {/* Desktop: the painted scene is the hero; live text sits where the mockup places it, scaled with the scene. */}
      <section className="@container relative mx-auto hidden w-full max-w-[1600px] md:block">
        <div className="relative aspect-[1536/1024] overflow-hidden">
          <Image
            src="/illustrations/hero-scene.webp"
            alt="A student in a purple hoodie smiles up at a university by a river, a plane flying overhead, with books and a notebook on the wall in front"
            fill
            priority
            sizes="(min-width: 1600px) 1600px, 100vw"
            className="object-cover"
          />
          <header className="absolute inset-x-[10%] top-[2%] flex items-center justify-between text-[1.15cqw]">
            <Link href="/" className="flex items-center gap-[0.6em] font-semibold text-[#1d1a33]" style={{ fontFamily: "var(--font-marker)", fontSize: "2.3cqw" }}>
              <span className="grid aspect-square w-[1.25em] place-items-center rounded-[0.25em] bg-primary text-white">
                <svg viewBox="0 0 16 16" className="h-[0.75em] w-[0.75em]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3.5 8.5l3 3 6-7" /></svg>
              </span>
              ApplyProof
            </Link>
            <nav className="ml-[6%] mr-auto flex gap-[3em] font-medium text-[#1d1a33]" aria-label="Main">
              {NAV.map((n) => <a key={n.label} href={n.href} className="hover:text-primary">{n.label}</a>)}
            </nav>
            <Link href="/applications" className="btn-primary rounded-[0.6em] px-[1.6em] py-[0.75em] text-[1em]">Get Started <ArrowRight className="h-[1.1em] w-[1.1em]" aria-hidden /></Link>
          </header>

          <div className="absolute left-[11.2%] top-[16%] w-[40%]">
            <Headline className="text-[7.2cqw]" />
            <p className="mt-[1.4cqw] max-w-[35cqw] text-[1.45cqw] leading-snug text-ink">Turn official application guidelines into a clear checklist. Find missing documents, catch issues, and see the evidence behind every finding.</p>
            <div className="mt-[2.4cqw] flex gap-[1.7cqw] text-[1.3cqw]">
              <Link href="/applications" className="btn-primary rounded-[0.55em] px-[2.4em] py-[1em] text-[1em]">Get Started <ArrowRight className="h-[1.1em] w-[1.1em]" aria-hidden /></Link>
              <a href="#how" className="btn-secondary rounded-[0.55em] border-line px-[1.8em] py-[1em] text-[1em] text-[#1d1a33]">See how it works</a>
            </div>
            <Badges className="mt-[3.3cqw] max-w-[36cqw] gap-[1.5cqw] text-[0.95cqw]" />
          </div>

          {[["8.6%", "12%", "2.4cqw", "0s"], ["7.4%", "53%", "1.9cqw", "1.2s"], ["48.5%", "30%", "2cqw", "0.6s"], ["57%", "6%", "2.4cqw", "1.8s"], ["94.5%", "4%", "2.2cqw", "0.9s"]].map(([left, top, size, delay]) => (
            <Sparkle key={left + top} className="absolute animate-[twinkle_3.2s_ease-in-out_infinite]" style={{ left, top, width: size, height: size, animationDelay: delay }} />
          ))}
        </div>
      </section>

      {/* Phones and small tablets: text first, then the illustration, so nothing sits on busy artwork. */}
      <div className="px-4 md:hidden">
        <header className="flex items-center justify-between gap-4 py-5">
          <Logo />
          <Link href="/applications" className="btn-primary">Get Started</Link>
        </header>
        <Headline className="mt-4 text-[15vw]" />
        <p className="mt-5 text-lg text-ink">Turn official application guidelines into a clear checklist. Find missing documents, catch issues, and see the evidence behind every finding.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/applications" className="btn-primary px-5 py-3 text-base">Get Started <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <a href="#how" className="btn-secondary px-5 py-3 text-base">See how it works</a>
        </div>
        <Badges className="mt-7 gap-3 text-xs" />
        <div className="relative mt-8 rotate-[1.5deg] rounded-[24px] bg-white p-2.5 shadow-[0_24px_50px_-26px_rgba(48,43,64,0.5)]">
          <Image src="/illustrations/hero-student.webp" alt="" width={776} height={928} sizes="100vw" className="h-auto w-full rounded-[16px]" />
          <span className="absolute -top-3 left-8 h-6 w-24 -rotate-6 rounded-sm bg-lilac/80" aria-hidden />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
          <ReplayIntroButton className="text-sm text-muted underline-offset-4 hover:text-primary hover:underline" label="Replay intro" />
        </footer>
      </div>
    </>
  );
}
