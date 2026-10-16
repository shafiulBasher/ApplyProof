import Link from "next/link";
import { ArrowRight, ClipboardList, FileSearch, FileUp, Quote, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";
import Intro from "@/components/Intro";
import { DeskScene, PaperPlane, Sparkle } from "@/components/Illustrations";

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

        <section className="grid items-center gap-10 py-10 md:grid-cols-[1.05fr_1fr] md:py-16">
          <div>
            <p className="hand-note text-2xl text-primary-ink">A bigger chapter awaits…</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.02] sm:text-6xl">
              Apply with <em className="font-display italic text-primary">confidence</em>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">
              Turn scholarship and job requirements into a clear, source-linked checklist, and know what&apos;s missing before you submit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/applications" className="btn-primary px-5 py-3 text-base">Get started <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="btn-secondary px-5 py-3 text-base">How it works</a>
            </div>
            <p className="mt-4 text-sm text-muted">Free. No account needed. Your files stay on your device.</p>
          </div>
          <div className="relative">
            <DeskScene className="w-full" />
            <PaperPlane className="absolute -top-2 right-6 h-8 w-12 animate-[float_5s_ease-in-out_infinite]" />
            <Sparkle className="absolute bottom-10 left-2 h-6 w-6 animate-[twinkle_3s_ease-in-out_infinite]" />
            <p className="hand-note absolute -bottom-2 right-4 hidden rotate-[-4deg] sm:block">Same applications. Bigger opportunities.</p>
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
