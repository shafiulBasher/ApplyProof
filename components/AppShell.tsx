"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Home } from "lucide-react";
import Logo from "./Logo";
import { PaperPlane } from "./Illustrations";

const NAV = [
  { href: "/", label: "Home", icon: Home, active: (p: string) => p === "/" },
  { href: "/applications", label: "Applications", icon: FolderOpen, active: (p: string) => p.startsWith("/applications") },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const links = NAV.map((n) => (
    <Link
      key={n.href}
      href={n.href}
      aria-current={n.active(path) ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${n.active(path) ? "bg-lilac text-primary-ink" : "text-muted hover:bg-lilac/50 hover:text-ink"}`}
    >
      <n.icon className="h-4 w-4" aria-hidden /> {n.label}
    </Link>
  ));
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-white/60 px-4 py-6 backdrop-blur lg:flex">
        <Logo href="/applications" />
        <nav className="mt-8 space-y-1" aria-label="Main">{links}</nav>
        <div className="mt-auto pb-2" aria-hidden>
          <PaperPlane className="ml-24 h-7 w-10 -rotate-6" />
          <p className="hand-note mt-2 -rotate-3 text-xl">Same applications.<br />Bigger opportunities.</p>
        </div>
      </aside>
      <header className="flex items-center justify-between gap-3 border-b border-line bg-white/70 px-4 py-3 backdrop-blur lg:hidden">
        <Logo href="/applications" />
        <nav className="flex gap-1" aria-label="Main">{links}</nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
