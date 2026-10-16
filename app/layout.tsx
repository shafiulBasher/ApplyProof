import type { Metadata } from "next";
import { Caveat, DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ApplyProof",
  description: "Turn application requirements into a clear, source-linked checklist.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${caveat.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-[15px]">{children}</body>
    </html>
  );
}
