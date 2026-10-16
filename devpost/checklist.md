---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Create an application and upload PDFs that get read and counted**
  Becomes usable: Open the app, create an application, upload the sample PDFs, and see each file's page count, word count, and suggested type (which you can change). An unreadable PDF shows a clear error and stays listed. Everything is still there after a reload.
  Why now: Sets up the project and proves the first unknown (reading PDFs page by page in a Next.js route). It also creates the synthetic demo files every later slice is tested with.
  PRD ref: `prd.md > The Core Journey` (steps 1–3), `prd.md > Application Management`, `prd.md > Document Upload and Identification`, `prd.md > States and Boundaries` (unreadable PDF, persistence)
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > File Structure`, `spec.md > Components` (Dashboard Page, New Application Dialog, Single Application Page, Document Manager, Parse Route, Document Type Hints, Storage Layer, Sample Documents and Extraction Test), `spec.md > Data Model`, `spec.md > Look and Feel`
  Build: Scaffold Next.js + TypeScript + Tailwind (palette tokens, Inter) in the repo root; add `.env.example`; write `scripts/make-samples.ts` (pdf-lib) and `npm run samples`; Dexie storage for `applications` and `documents`; a simple dashboard list with the New Application dialog; the Single Application Page with the Document Manager (guideline slot, applicant list, type dropdown, replace/remove); the Parse Route (unpdf, pages/counts/readable); filename type hints; content hash on upload.
  Verify (mechanical): `npm run samples` creates the PDFs; `npm run build` passes; with `npm run dev` running, POST `samples/cv-3-pages.pdf` to `/api/parse` and confirm `pageCount: 3`, and the motivation letter returns about 620 words; a small Vitest check for the filename hints passes.
  Learner check: Run `npm run dev`, open http://localhost:3000, create "Global Future Scholars Scholarship", upload the guideline and the four applicant sample files. Each shows the right page count and suggested type. Reload the page: everything is still there.
  Commit: `Scaffold app with applications, PDF upload, and page/word counts`

- [x] **2. Gemini reads the guideline and every requirement comes with a verified quote**
  Becomes usable: Clicking Run Readiness Check (after the AI disclosure) shows the list of requirements Gemini found in the guideline, each with its exact quote and confirmed page number. You can also run the accuracy test from the terminal.
  Why now: This is the biggest risk and your stated question: "Is a free model good enough at extracting requirements?" If it falls short, we find out before building on top of it, and we can tighten the prompt or switch models through the adapter.
  PRD ref: `prd.md > Requirement Extraction`, `prd.md > AI Disclosure`, `prd.md > States and Boundaries` (no guideline, check in progress, check fails)
  Spec ref: `spec.md > Components` (Extract Route, AI Provider Adapter, Quote Verifier, Run Button and Disclosure Dialog, Sample Documents and Extraction Test), `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`, `spec.md > Data Model` (`extractions`)
  Build: Confirm the current Gemini Flash model ID and `@google/genai` JSON-output config; add the provider interface and Gemini implementation; the Extract Route with `[[PAGE n]]` labels, one retry on malformed JSON, and a clear 429 error; the Quote Verifier; the disclosure dialog before the first upload; the Run button (disabled until a readable guideline exists, disabled while running); cache extractions by guideline fingerprint; `samples/expected-requirements.json` and `scripts/test-extraction.ts`.
  Verify (mechanical): Vitest for the Quote Verifier (exact match, wrong page corrected, not found → unverified, hyphenated line breaks); `npx tsx scripts/test-extraction.ts` finds every expected requirement with all quotes verified; `npm run build` passes.
  Learner check: Get a free Gemini key from Google AI Studio and put it in `.env.local` (I'll walk you through it). In your application, click Run Readiness Check. You should see about eight requirements, such as "CV max 2 pages", each with a quote and "Guideline · p. N" that you can find in the guideline PDF.
  Commit: `Extract guideline requirements with Gemini and verify quotes`

- [x] **3. The readiness check flags the 3-page CV, with the rule quoted beside it**
  Becomes usable: Enter your GPA, degree, and nationality, then run the check. Results appear in fix-first groups (Action Needed, Needs Verification, Passed), each finding with an explanation, the highlighted quote and page, your file's evidence, and a correction. The 3-page CV is Action Needed against the 2-page rule; one of two recommendation letters is Action Needed; the 620-word letter is Passed; the ambiguous English rule is Needs Verification.
  Why now: This is your unique kernel, real files checked against official rules with evidence. It comes right after extraction is proven, so the rest of the build adds to a working core.
  PRD ref: `prd.md > The Core Journey` (steps 4–6), `prd.md > Readiness Checks`, `prd.md > Evidence-Linked Findings`, `prd.md > Fix-First Results`
  Spec ref: `spec.md > Components` (Applicant Info Form, Checker, Status Rules, Check Orchestrator, Results Panel and Finding Card, StatusBadge), `spec.md > Data Model` (`results`, Requirement, Finding, CheckResult), `spec.md > Look and Feel`
  Build: Applicant Info Form (saves as you type); the Checker for required documents, page/word limits, eligibility, and the always-Needs-Verification categories; Status Rules and outstanding count; the orchestrator storing the current result; the Results Panel with collapsible, counted groups, finding cards, and the header status pill.
  Verify (mechanical): Vitest for the Checker and Status Rules using the PRD's examples (3 vs. 2 pages → Action Needed; 620 in 500–800 → Passed; 1 of 2 letters → Action Needed; different GPA scale or missing field → Needs Verification; unverified quote → Needs Verification; never Passed with anything unverified); `npm run build` passes.
  Learner check: With the sample package and your facts entered, run the check. The CV finding is at the top under Action Needed, showing "Official limit: 2 pages · Uploaded CV: 3 pages" and the guideline quote with its page. Tell me whether the results read clearly and look the way you pictured.
  Commit: `Run readiness check with evidence-linked, fix-first findings`

- [x] **4. Upload the guideline and see a checklist of required documents; every finding gets a specific next step**
  Becomes usable: Right after you upload the guideline, a checklist appears ("This guideline asks for: CV · max 2 pages, Motivation letter · 500–800 words, Transcript, 2 recommendation letters") and ticks items off as you upload matching files. If Google is busy, it says "Couldn't read the requirements yet" with a Retry button. In the results, the generic "check it yourself" lines are replaced with facts plus a labeled Next step, and the deadline shows only the date, time, and timezone the guideline states.
  Why now: Your slice 3 feedback. It changes when the guideline is sent (at upload instead of at Run) and how findings read, so it belongs before What Changed builds on top of the results.
  PRD ref: `prd.md > Required-Documents Checklist`, `prd.md > Requirement Extraction`, `prd.md > Evidence-Linked Findings`, `prd.md > AI Disclosure`, `prd.md > States and Boundaries` (requirements can't be read yet)
  Spec ref: `spec.md > Components` (Requirements Checklist, Run Button and Disclosure Dialog, Checker), `spec.md > Data Model` (Requirement `deadline`, `extractions.version`)
  Build: Read the requirements right after a guideline upload (only after the disclosure is accepted), cached and versioned; the RequirementsChecklist under the guideline, sharing the Checker's document counting; Retry on failure; Run disabled while reading; new disclosure wording; Checker explanations rewritten as facts plus a Next step for every Action Needed and Needs Verification finding; deadline fields extracted and kept only where they appear in the quote.
  Verify (mechanical): Vitest for the new next steps (second letter, revised CV, unclear eligibility, every Needs Verification has a next step) and the deadline rule (an invented timezone isn't shown); `npx tsc --noEmit` passes; `npm run test:extraction` still finds 10/10 with all quotes verified, and the deadline comes back with date, time, and timezone.
  Learner check: Create a new application and upload `guideline.pdf`. The checklist appears under it. Add your documents one by one and watch items tick off; recommendation letters show "1 of 2". Run the check: each Needs Verification card shows a specific Next step, and the deadline reads "Submit by October 20, 2027, 23:59 CET."
  Commit: `Add required-documents checklist and specific next steps`

- [x] **5. Replace the CV, rerun, and watch Action Needed flip to Passed**
  Becomes usable: Replacing a file or editing your info marks the results Outdated. Rerunning is instant and makes no AI call, because the guideline's requirements are remembered. A "What Changed since your last check" summary shows "CV length: Action Needed → Passed", "CV pages: 3 → 2", and the issue count change, with a mint pulse on the finding that passed. If a check fails, your previous results stay and the error shows separately.
  Why now: This completes the demo path, your "oh, that's cool" moment. It needs a working check (slice 3) to compare against.
  PRD ref: `prd.md > The Core Journey` (steps 7–8), `prd.md > Recheck and What Changed`, `prd.md > States and Boundaries` (inputs changed, check fails)
  Spec ref: `spec.md > Components` (Check Orchestrator, Status Rules — input fingerprint, What Changed, Results Panel and Finding Card), `spec.md > Data Model` (`results`, hashes), `spec.md > Look and Feel` (Motion)
  Build: Input fingerprint and Outdated notice; previous/current results; `lib/diff.ts` matched by requirement ID, with the "new guideline" case claiming no improvements; the WhatChanged component; status-change transition (respecting reduced motion); error kept separate from stored results.
  Verify (mechanical): Vitest for What Changed (status and measured changes, count change, new guideline → no improvement claims) and for the input fingerprint (a same-count replacement still changes it); `npm run build` passes; the rerun makes no request to `/api/extract` (confirmed in the dev server log).
  Learner check: Replace `cv-3-pages.pdf` with `cv-2-pages.pdf`. The Outdated notice appears. Rerun: What Changed shows the CV going from Action Needed to Passed, and the check finishes almost instantly.
  Commit: `Add recheck with Outdated notice and What Changed summary`

- [x] **6. A dashboard of applications that shows where each one stands**
  Becomes usable: The dashboard shows a polished card per application: name, organization, deadline chip, status pill, issue count, and a progress bar. First use shows a friendly empty state. If the browser can't save something, you're told which item wasn't kept. The README explains setup and the demo steps.
  Why now: Multiple applications and polish were kept in scope as long as they don't delay the demo path, which is now done.
  PRD ref: `prd.md > The Core Journey` (steps 1, 9), `prd.md > Screens and Layout > Application Dashboard`, `prd.md > Application Management`, `prd.md > States and Boundaries` (first use, persistence fallback), `prd.md > Look and Feel`
  Spec ref: `spec.md > Components` (Dashboard Page, Application Card, Storage Layer), `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Application cards with status from the stored result and a progress bar; the empty state; the storage-failure message; hover and fade transitions; README with setup, run, and demo steps.
  Verify (mechanical): `npm run build` and all Vitest tests pass; the dev server renders the dashboard with no console errors; `git check-ignore .env.local` confirms the key file is ignored and `.env.example` has no real value.
  Learner check: Go back to the dashboard. Your scholarship card shows its latest status and issue count. Create a second application and confirm it starts empty and Not Checked, and that the first one's files and results are untouched.
  Commit: `Add application dashboard cards, empty state, and README`

- [x] **7. Paste the guideline text instead of uploading a PDF**
  Becomes usable: The guideline slot offers Upload guideline PDF or Paste guideline text. Pasted text (at least 30 words) goes through the same disclosure, single cached Gemini read, checklist, quote verification, and fix-and-rerun path; its quotes are labeled "Pasted guideline" instead of a page number.
  Why now: Learner request during the final review — many scholarship and job requirements are published directly on websites.
  PRD ref: `prd.md > Document Upload and Identification`, `prd.md > Evidence-Linked Findings`, `prd.md > Non-Goals`
  Spec ref: `spec.md > Components` (Document Manager, Results Panel and Finding Card), `spec.md > Data Model` (`documents.source`, `CheckResult.guidelinePasted`), `spec.md > What Was Simplified and Why`
  Build: Paste box in the guideline slot with a 30-word minimum; pasted text stored as a one-"page" guideline document with `source: 'pasted'`; results remember `guidelinePasted` so cards show "Pasted guideline"; `samples/job/job-posting.txt` for trying it.
  Verify (mechanical): `npx tsc --noEmit` and all Vitest tests pass; the pasted job posting sent through the running app's extract route returns 9 requirements with 9/9 quotes verified; the scholarship accuracy test still finds 10/10.
  Learner check: Create an application, click Paste guideline text, paste the contents of `samples/job/job-posting.txt`, and save. The checklist appears; run the check and confirm each quote says "Pasted guideline".
  Commit: `Allow pasting the guideline as text`

- [x] **8. Dream Journal redesign: landing page, intro, and a warm illustrated interface**
  Becomes usable: A landing page with a one-time, skippable intro; an illustrated dashboard with filters; a workspace with a four-step progress tracker, drag-and-drop zones, and Upload PDF / Paste text tabs; results with butter quote panels, labeled evidence, and Next steps. All logic is unchanged.
  Why now: Learner's design brief and visual reference during the final review.
  PRD ref: `prd.md > Look and Feel`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Components` (Landing Page, App Shell, Dashboard Page), `spec.md > File Structure`
  Build: Tokens and fonts; shared classes in the components layer; SVG illustration set; Intro; landing page at `/`; dashboard moved to `/applications` inside an App Shell; every component restyled. Fixed a checklist flash ("Couldn't read…" appearing for an instant after upload).
  Verify (mechanical): `npx tsc --noEmit`, 22/22 Vitest, `npm run build`; an Edge-driven run of the full workflow on a fresh production build (intro once, disclosure before sending, checklist read, documents, details, check, CV replacement → Outdated → rerun in 45 ms with no AI call → What Changed), screenshots at 1440px and 390px, no horizontal overflow on mobile, intro skipped with reduced motion, no console errors.
  Learner check: Restart `npm run dev`, open http://localhost:3000, watch the intro (or skip it), click Get started, and run the scholarship demo.
  Commit: `Redesign the interface in the Dream Journal style`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 3 (the first real findings; your feedback can still shape the What Changed view and the dashboard). Learner tried slices 1–3; feedback (generic "check it yourself" lines, wanted a required-documents list after the guideline upload) became slice 4, which they retried and confirmed in the app (checklist ticks, Next steps, deadline "Submit by October 20, 2027, 23:59 CET.").
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Wording polish: CV/résumé, motivation/cover letter, recommendation/reference letter; singular "1 page" — verified by Vitest (22/22) and tsc.
- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

- Model is now a short list of free Flash models (`GEMINI_MODEL=gemini-3.8-flash,gemini-3.5-flash,gemini-3.5-flash-lite`; Flash-Lite added after the job demo hit "busy" on both others, and it passed the same 10/10 accuracy test with correct deadline parts), tried in order only on "busy" (503) or "quota" (429) — both models passed the accuracy test (10/10 found, 10/10 quotes verified), but each returned "high demand" at different moments during slices 2–3. Still free only; no paid fallback.
- Added slice 4 (required-documents checklist + specific next steps) and renumbered What Changed to 5 and the dashboard to 6 — learner feedback at the slice 3 checkpoint: the generic "check it yourself" lines looked odd, and they want to see required documents right after uploading the guideline. The guideline's text is now sent at upload (after the disclosure) instead of at Run; PRD and spec updated to match.
- Expected-requirements list grew from 8 rules to 10 checks — the guideline lists the CV and motivation letter as required documents as well as length-limited ones, so each gets a "required" check and a length check, matching the extraction prompt's one-item-per-rule design.
- Faster, more resilient guideline reading — learner asked for more free models and a shorter wait after uploading the guideline. Gemini now uses low "thinking" (the default took ~16s; low takes ~7–12s; "minimal" was rejected by some models and cost Flash-Lite a requirement). The fallback list grew to five free models, fastest first (`gemini-flash-lite-latest, gemini-3.5-flash, gemini-3.6-flash, gemini-3.5-flash-lite, gemini-3.8-flash`), and any error except a bad key moves on to the next model, each tried once. The prompt now says every "who may apply" rule is its own eligibility item, after a lite model skipped the degree rule; with that line every model tested scored 10/10 with all quotes verified.
- Added slice 7 (paste the guideline as text) — learner request during the final review. PRD Non-Goals now allow pasted text for the guideline only; applicant documents stay PDF-only.
- Extraction prompt: "nationality" is only for citizenship; work authorization, visa, residency, and language rules are unclear eligibility (Needs Verification) — the pasted job posting's "legally authorized to work in the European Union" came back as a nationality rule, which could have wrongly shown Action Needed. Cache version bumped to 3 so saved guidelines are re-read once with the fixed prompt.
- Document wording now names both forms ("CV/résumé", "motivation/cover letter", "recommendation/reference letter") and units read in the singular ("1 page") — learner-approved polish during the final review, after the job demo read "Uploaded CV" and "Official limit: 1 pages". PRD and README examples updated to the new wording.
- Added slice 8 (Dream Journal redesign) and a Landing Page; the dashboard moved from `/` to `/applications` — learner design brief during the final review. Illustrations are hand-drawn-style SVG line art rather than the reference's painted artwork (no paid asset services); no Settings page (not in scope). The overall "Passed" status now reads **Ready**, matching the reference.
