---
doc: spec
status: approved
---

# ApplyProof — Technical Spec

## How This Works, In Plain Language

ApplyProof is a **web app that runs on your laptop** and opens in your browser at `http://localhost:3000`. It's built with **Next.js**, a toolkit that keeps the page you see and a small behind-the-scenes helper in one project. It has five pieces:

1. **The pages you see.** These are the Dashboard and the Single Application Page. They show your applications, files, form, and results.
2. **The browser's filing cabinet (IndexedDB).** This is storage built into your browser, just for this site. Your applications, uploaded PDFs, applicant info, and results are kept there, so they're still there tomorrow. Clearing your browser data empties it. Nothing is stored on a server.
3. **The helper (server routes).** This is a small program that runs on your laptop next to the page. It does the two jobs the page can't safely do itself:
   - It reads the text out of PDFs, page by page.
   - It talks to Google's AI, sending **only the official guideline's text**. Your own documents never leave your laptop. The AI needs a secret key, and that key lives only in a hidden settings file (`.env.local`) the helper reads. It's never in the page, and never on GitHub.
4. **The AI (Gemini Flash, free tier).** It does exactly one job: read the guideline and list its requirements as structured data. Each requirement comes with the exact quote and its page number.
5. **The checker (plain code).** Everything that can be decided objectively is decided by ordinary code, not the AI:
   - **Quote check:** it confirms each AI quote really appears on the page it claims. If it doesn't, that finding becomes **Needs Verification**.
   - **Measurable checks:** it counts pages and words, counts documents of each type, and compares your GPA, degree, and nationality with clearly stated rules.
   - **Document types:** it suggests each file's type from its filename (for example "CV_Jane.pdf" → CV), and you confirm it.
   - **Status and changes:** it decides Passed, Action Needed, or Needs Verification, and works out What Changed between two checks.

**The key trick for your demo:** the AI reads a guideline once, and the requirements it found are remembered. When you replace your CV and rerun, only the checker runs again, against the same requirements. That makes reruns instant and free, and What Changed reliable, because it compares the same rules both times.

**Why this shape:** one project and one language (JavaScript/TypeScript), with no database server, no login, and one free AI service behind a swappable adapter. It's the smallest setup that proves your kernel: real files checked against official rules, with verified evidence.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Arrive.** The browser opens `localhost:3000`. The **Dashboard** reads all applications from IndexedDB and shows a card for each, or the empty state.
2. **Create.** **+ New Application** opens a dialog. Saving writes a new application record to IndexedDB with status Not Checked, then opens `/applications/[id]`.
3. **Upload.** Before the first upload in an application, the **AI disclosure dialog** appears. Right after a readable guideline is saved, the page runs the **extraction** (steps 5.1–5.3 below) and shows the **Requirements Checklist**. Each PDF then goes from the page to the helper's **parse route**, which does two things (no AI involved):
   - It extracts the text page by page and counts the pages and words.
   - It flags an unreadable PDF (almost no text).

   The page computes a **content fingerprint** (a hash of the file's bytes), suggests a type from the filename, and saves the file, page texts, counts, and fingerprint in IndexedDB. The user confirms the type in a dropdown.
4. **Enter facts.** The Applicant Information form saves GPA, grading scale, degree, and nationality to IndexedDB as they're typed.
5. **Run.** (The extraction normally already happened at guideline upload, so this step makes no AI call.)
   1. If this guideline hasn't been read before (its fingerprint is built from its page-by-page text), the page sends its page texts to the helper's **extract route**. This is the only data that goes to Google.
   2. The extract route asks Gemini for the requirements, then runs the **quote check** against the guideline text.
   3. It returns verified requirements, each with its confirmed page, and the page saves them together with the exact page texts they were verified against.
6. **Evaluate.** In the browser, the **checker** compares the requirements with the confirmed file types, page and word counts, and applicant facts. That produces the findings and the overall status.
7. **Save and show.** The previous result moves to "previous" and the new one becomes "current". The **Results** section shows the findings fix-first: Action Needed, then Needs Verification, then Passed.
8. **Fix and rerun.** The user replaces the 3-page CV. The parse route reads the new one (2 pages), its content fingerprint changes, and the Outdated notice appears. They run the check again. The guideline is unchanged, so **no AI call is made**: the checker reruns, and **What Changed** compares previous with current (CV length: Action Needed → Passed).
9. **Back to the Dashboard.** The card shows the new status and issue count.

## Stack

| Piece | Choice | Why (learner-agreed) | Docs |
|---|---|---|---|
| App framework | **Next.js** (current stable, App Router) with **TypeScript** | One project for the pages and the helper, in one language. Recommended by the agent and accepted by the learner. | https://nextjs.org/docs |
| Styling | **Tailwind CSS** | Fast, consistent styling with your palette as named colors. | https://tailwindcss.com/docs |
| Font | **Inter**, via `next/font/google` | From `prd.md > Look and Feel`. | https://nextjs.org/docs/app/getting-started/fonts |
| Icons | **lucide-react**, plus a few custom SVG status icons | Clean icons, with custom touches where they matter. | https://lucide.dev/guide/packages/lucide-react |
| PDF reading | **unpdf** (a JavaScript wrapper around Mozilla's PDF.js) | Gives page-by-page text and the exact page count, in JavaScript. The learner chose it over PyMuPDF to avoid a Python backend. | https://github.com/unjs/unpdf |
| Browser storage | **Dexie** (a friendly layer over IndexedDB) | Stores files and data in the browser, with no login (learner's choice). | https://dexie.org/docs |
| AI | **Google Gemini Flash, free tier**, via the **`@google/genai`** SDK | Free, and a whole guideline fits in one request with no splitting (learner's choice). | https://ai.google.dev/gemini-api/docs · https://ai.google.dev/gemini-api/docs/structured-output · https://github.com/googleapis/js-genai |
| Sample PDFs | **pdf-lib**, in a script that generates the synthetic demo documents | Repeatable, clearly fake demo files. | https://pdf-lib.js.org |
| Small tests | **Vitest**, for the checker, quote check, and What Changed | Lets the build agent prove the logic. The learner verifies through the app. | https://vitest.dev |

**To verify at the start of the build (not checked during planning):**
- The exact current Gemini Flash model ID, and its free-tier limits, in Google AI Studio (https://aistudio.google.com). It's set in `GEMINI_MODEL`, so changing it means no code change.
- The current `@google/genai` call shape for JSON output (`responseMimeType` plus a schema).
- That unpdf's per-page text extraction works in a Next.js route.
- That the browser's built-in Web Crypto (`crypto.subtle.digest('SHA-256', …)`) is available on `localhost`, for the fingerprints. It is in modern browsers.

## Where It Runs and How Someone Tries It
- **Runtime:** local only. A Node.js process on the learner's laptop (Node 22, already installed), viewed in a browser.
- **Setup:**
  1. `npm install`
  2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (a free key from Google AI Studio) and `GEMINI_MODEL`.
  3. `npm run samples` generates the synthetic demo PDFs in `samples/`.
- **Start:** `npm run dev`, then open **http://localhost:3000**.
- **Demo recording:**
  1. Create the "Global Future Scholars Scholarship" application.
  2. Upload `samples/guideline.pdf`, `cv-3-pages.pdf`, `motivation-letter.pdf`, `transcript.pdf`, and `recommendation-1.pdf`.
  3. Enter the applicant facts and run the check. Show the CV finding (Action Needed) with its quote and page.
  4. Replace it with `cv-2-pages.pdf` and rerun. Show What Changed: Action Needed → Passed.
- **Submission:** the demo video, plus a public GitHub repo with the code and `devpost/scope.md`, `prd.md`, and `spec.md`.
- **Deployment:** none for now; hosting can come after the MVP (learner's choice).
- **Secrets:** `.env.local` is git-ignored, and only `.env.example` (no real key) is committed. Check this before every push.

## Look and Feel
From `prd.md > Look and Feel`: "Colorful and memorable on the surface, precise and trustworthy at the core."

- **Palette (Tailwind theme tokens):**
  - `navy` #14193A (headings, dark surfaces)
  - `violet` #5B4CF0 (primary actions, accents)
  - `mint` #3CCF9A (**Passed**)
  - `amber` #E0A23A (**Needs Verification**)
  - `rose` #C0544E (muted red, **Action Needed**)
  - `paper` #FAF8F3 (warm off-white background)
  - `slate` #5D6480 (secondary text)
  - A subtle violet-to-mint gradient is used only on the logo and the primary button hover.
- **Type:** Inter. Bold, tight headings (dashboard title around 32px, section titles around 20px), 15–16px body text, tabular numbers for counts.
- **Surfaces:** white cards with rounded corners (12–16px), a soft border, and very light shadow. The status color shows as a left accent bar and a pill badge. No glassmorphism.
- **Dashboard:** a card grid. Each card has the program name, organization, a deadline chip, a status pill, an issue count, and a compact progress bar (share of requirements Passed). The **+ New Application** button sits top right, in violet, with an icon.
- **Results:**
  - Each finding card shows the requirement as its title, a one-line explanation, a highlighted quote (amber-tinted block, with "Guideline · p. 3" below), evidence from the applicant's side ("Your CV: 3 pages"), and a correction for Action Needed findings.
  - Group headers show counts, and each group can be collapsed.
- **Motion:** CSS transitions only. A 150–250ms fade and slide when results update, hover lift on cards, and on Passed a brief mint pulse and checkmark draw. Respects `prefers-reduced-motion`.
- **Copy tone:** plain, calm, specific. "Upload an official application guideline first." No hype, and no AI-sounding filler.
- **Avoid:** generic AI landing-page layouts, heavy gradients, glass effects, decorative animation, crowded dashboards.

## Components

### Dashboard Page
`app/page.tsx` loads all applications from the **Storage Layer** and renders an **Application Card** for each, plus the empty state and the **New Application Dialog**.
PRD ref: `prd.md > Application Management`, `prd.md > Screens and Layout > Application Dashboard`, `prd.md > States and Boundaries` (first use).

### Application Card
Shows the name, organization, deadline, overall status, outstanding-issue count, and progress bar. Clicking it opens the application. Its status comes from the stored current result, via the **Status Rules**.
PRD ref: `prd.md > Application Management`, `prd.md > Fix-First Results`.

### New Application Dialog
Asks for a name (required), plus organization and deadline (optional). Save is disabled until a name exists. It creates the record and opens the application.
PRD ref: `prd.md > Application Management`.

### Single Application Page
`app/applications/[id]/page.tsx` lays out, top to bottom: Header (name, deadline, status, **Run Readiness Check**), **Document Manager**, **Applicant Info Form**, **Results Panel**. It runs the check flow (see **Check Orchestrator**).
PRD ref: `prd.md > Screens and Layout > Single Application Page`.

### Document Manager
- Has a guideline slot (one file) and an applicant documents list.
- The first upload in an application shows the **Disclosure Dialog** first. Upload sends each file to the **Parse Route**, computes its content fingerprint, gets a filename-based suggestion from **Document Type Hints**, then saves everything.
- Each row shows the filename, a type dropdown (CV, motivation letter, transcript, recommendation letter, other), page and word counts, and Replace / Remove.
- When the filename doesn't clearly match one type, the dropdown starts on "Choose type…" and the check treats the file as unconfirmed.
- Unreadable files show the PRD's error message and stay listed so they can be replaced.

PRD ref: `prd.md > Document Upload and Identification`, `prd.md > States and Boundaries` (unreadable PDF).

### Applicant Info Form
Fields for GPA, grading scale (for example 4.0 or 10), degree, and nationality. It saves as you type.
PRD ref: `prd.md > Readiness Checks` (basic eligibility).

### Run Button and Disclosure Dialog
- The Run button is disabled with the hint "Upload an official application guideline first." until a readable guideline exists. It's also disabled while a check is running.
- The disclosure appears before the first upload in an application (learner-confirmed timing). It reads: "When you upload an official guideline, its text is sent to Google's Gemini API to extract its requirements. On the free tier, Google may use this data to improve its products. Your own documents (CV, letters, transcripts) are never sent; they're read and checked on this device. Use sample or non-sensitive guidelines if you're unsure." The user picks **Continue** or **Cancel**, and the acknowledgment is stored per application. Nothing is sent to Google before it's accepted; the guideline's text is sent right after the guideline upload.

PRD ref: `prd.md > AI Disclosure`, `prd.md > States and Boundaries`.

### Requirements Checklist
`components/RequirementsChecklist.tsx`, shown under the guideline in the **Document Manager**. The page calls `getExtraction` right after a guideline upload (only when the disclosure is accepted), and `cachedExtraction` (no network) when the page opens.
- Lists every `required_document` requirement with its count and any verified page/word limit for the same document type.
- Ticks an item when the count of readable files with that confirmed type reaches the required count ("1 of 2" otherwise). It uses the same `countDocs` helper as the **Checker**, so the two never disagree. A tick means uploaded, not passed.
- Notes unconfirmed files that aren't counted, and flags requirements whose quote couldn't be confirmed.
- While reading: a spinner. On failure, or before any read: "Couldn't read the requirements yet" with **Retry**. The Run button is disabled while reading, so the guideline is never sent twice at once.

PRD ref: `prd.md > Required-Documents Checklist`.

### Check Orchestrator
`lib/runCheck.ts`, called by the Run button. Its steps:
1. If there's no extraction for this guideline's fingerprint (a hash of its page-by-page text), call the **Extract Route** and save the result.
2. Run the **Checker** with the requirements, the confirmed documents, and the applicant facts.
3. Store the result: the old current result becomes previous, and the new one becomes current, with the **input fingerprint** (see **Status Rules**).
4. On error, keep the stored results unchanged and show the error separately.

PRD ref: `prd.md > Recheck and What Changed`, `prd.md > States and Boundaries` (check fails).

### Parse Route
`app/api/parse/route.ts` (server). It receives one PDF and returns `{ pages: string[], pageCount, wordCount, readable }`. It makes **no AI call**.
- Text and counts come from **unpdf**.
- A file is unreadable if the average text per page is below about 20 characters.

PRD ref: `prd.md > Document Upload and Identification`.

### Extract Route
`app/api/extract/route.ts` (server). It receives the guideline's page texts and returns verified requirements:
1. It builds a prompt with the page texts labeled `[[PAGE 1]]`, `[[PAGE 2]]`, and so on.
2. It asks the **AI Provider Adapter** for JSON that matches the **Requirement** shape.
3. It runs the **Quote Verifier** on every item, against the same page texts it sent.
4. It returns the requirements together with those page texts, so the cache always keeps requirements and their page boundaries together.
5. If the free quota is exhausted (HTTP 429), it returns a clear error and makes no other call. **It never falls back to a paid service.**

PRD ref: `prd.md > Requirement Extraction`.

### AI Provider Adapter
`lib/ai/provider.ts` defines one operation: `extractRequirements(pages)`. `lib/ai/gemini.ts` implements them with `@google/genai`, using `GEMINI_API_KEY` and `GEMINI_MODEL` from the environment. It sends `temperature: 0` and asks for JSON output with a schema. Swapping providers means adding one file and changing one import (learner requirement).
PRD ref: `prd.md > Requirement Extraction`, `prd.md > Product Decisions`.

### Document Type Hints
`lib/docTypes.ts` is plain code with no AI. It matches the filename against simple keyword lists (for example `cv`, `resume` → CV; `motivation`, `statement`, `essay` → motivation letter; `transcript`, `grades` → transcript; `recommendation`, `reference`, `rec` → recommendation letter). It suggests a type only when exactly one type matches, and otherwise returns nothing, so the user is asked.
PRD ref: `prd.md > Document Upload and Identification`.

### Quote Verifier
`lib/quotes.ts` normalizes text: lowercase, collapsed whitespace, matching quote styles, and line-break hyphens rejoined. Then:
- If the AI's quote is on its claimed page, the item is `quoteVerified: true`.
- If it's found on a different page, the page number is corrected and the item stays verified.
- If it isn't found anywhere, the item is `quoteVerified: false`. Its finding is forced to **Needs Verification**, with the note "We couldn't confirm this quote in the guideline."

PRD ref: `prd.md > Evidence-Linked Findings`, `scope.md > The Unique Kernel`.

### Checker
`lib/checks.ts` is pure code with no AI. It turns each requirement into one finding:
- **Required document:** counts confirmed files of that type against the required count. Missing or too few means Action Needed ("Two required; only one uploaded"). Unconfirmed files make it Needs Verification.
- **Page limit:** compares the exact page count with the limit. Over the limit means Action Needed ("Official limit: 2 pages · Uploaded CV: 3 pages").
- **Word limit:** compares the word count with the min/max range. In range means Passed, otherwise Action Needed.
- **Eligibility:**
  - GPA: if the rule's scale equals the entered scale, compare the numbers. A different scale or a missing value means Needs Verification, naming the field.
  - Degree and nationality: compare against the rule's listed values (case-insensitive). No clear list, or a missing value, means Needs Verification.
  - Rules the AI marked `clear: false` are always Needs Verification.
- **Deadline, formatting, other:** always Needs Verification, with the quote.
- Every Action Needed finding gets a `correction` string, and so does every Needs Verification finding. `explanation` holds facts (from the quote, the files, or the applicant info); `correction` holds the suggested next step, shown as **Next step:**. Examples: "Upload a revised CV of no more than 2 pages.", "Upload the second recommendation letter.", "Confirm the accepted evidence with the program organizer."
- **Deadline:** the AI returns `deadline: {date?, time?, timezone?}` copied from the quote, and code keeps only the parts that literally appear in the quote. All three → "Submit by October 20, 2027, 23:59 CET." A missing time or timezone is named and flagged for confirmation, never filled in.
- Requirements with an unverified quote are always Needs Verification.

PRD ref: `prd.md > Readiness Checks`, `prd.md > Evidence-Linked Findings`.

### Status Rules
`lib/status.ts`:
- No successful check yet means **Not Checked**.
- Otherwise: any Action Needed means **Action Needed**; else any Needs Verification means **Needs Verification**; else **Passed**.
- The status is never Passed while any required criterion is unverified.

The outstanding-issue count is Action Needed plus Needs Verification.

**Input fingerprint** (`lib/hash.ts`, SHA-256 via Web Crypto): built from the guideline's fingerprint (the hash of its page-by-page text, with page boundaries); each applicant document's **content hash** plus its confirmed type, sorted; and the applicant facts. The page shows **Outdated** whenever this differs from the fingerprint stored with the last successful result. That means any change to a relevant input, even a replacement with identical page and word counts.
PRD ref: `prd.md > Fix-First Results`, `prd.md > States and Boundaries` (inputs changed).

### What Changed
`lib/diff.ts` matches findings across the previous and current results by **requirement ID**. IDs are stable because the extraction is reused while the guideline is unchanged.
- It lists status changes, measured-value changes (pages, words, counts), and the change in the outstanding-issue count.
- If the guideline changed (so the requirement sets differ), it shows only "Requirements were re-read from a new guideline", and **claims no improvements**.

PRD ref: `prd.md > Recheck and What Changed`.

### Results Panel and Finding Card
- Order: Outdated notice (if any), then any check error, then **What Changed** (if there's a previous result), then three groups: Action Needed (expanded), Needs Verification (expanded if it has items), Passed (collapsed). Each group shows its count.
- A **Finding Card** shows the requirement, explanation, highlighted quote with its page, applicant-side evidence, and correction. It animates on a status change.

PRD ref: `prd.md > Fix-First Results`, `prd.md > Evidence-Linked Findings`.

### Storage Layer
`lib/db.ts` (Dexie) holds the tables in the **Data Model**. If a save fails (for example the storage quota is exceeded), it shows a clear message naming the item that wasn't kept.
PRD ref: `prd.md > States and Boundaries` (persistence, persistence fallback).

### Sample Documents and Extraction Test
- `scripts/make-samples.ts` generates clearly synthetic PDFs in `samples/`:
  - **Guideline** (3 pages, for the fictional "Global Future Scholars Scholarship"):
    - CV max 2 pages
    - motivation letter 500–800 words
    - transcript required
    - two recommendation letters
    - GPA ≥ 3.0 on a 4.0 scale
    - bachelor's degree required
    - deadline October 20
    - an ambiguous rule ("strong English proficiency")
  - Applicant files: `cv-3-pages.pdf`, `cv-2-pages.pdf`, `motivation-letter.pdf` (about 620 words), `transcript.pdf`, `recommendation-1.pdf`.
  - `samples/expected-requirements.json` lists what a correct extraction must find.
- `scripts/test-extraction.ts` runs the real Extract Route logic on the sample guideline and reports, against the expected list:
  - found / missing / extra requirements
  - quotes verified / not verified

PRD ref: `prd.md > Requirement Extraction`. Supports the learner's request to test Gemini's accuracy early.

## Data Model
All of this is in IndexedDB, via Dexie, in the user's browser. Nothing is stored on a server.

| Table | Fields | Updated when | When you come back |
|---|---|---|---|
| `applications` | `id, name, organization?, deadline?, applicant: {gpa?, gpaScale?, degree?, nationality?}, disclosureAccepted, createdAt` | creating; editing applicant info; accepting the disclosure | all still there |
| `documents` | `id, applicationId, role: 'guideline' \| 'applicant', fileName, blob, contentHash, pages: string[], pageCount, wordCount, readable, suggestedType?, confirmedType?, uploadedAt` | upload, type confirmation, replace (overwrites the same row), remove | all still there |
| `extractions` | `guidelineHash (key), pages: string[], requirements: Requirement[], model, version, createdAt` (a cached row with an older `version` is re-read after a prompt or schema change) | first run with a new guideline | reused, so no new AI call |
| `results` | `applicationId (key), current: CheckResult?, previous: CheckResult?, lastError?` | each run; on failure only `lastError` changes | all still there |

**Requirement:** `{ id, category: 'required_document'|'page_limit'|'word_limit'|'eligibility'|'deadline'|'formatting'|'other', title, docType?, count?, min?, max?, unit?: 'pages'|'words', eligibility?: { field: 'gpa'|'degree'|'nationality'|'other', minGpa?, scale?, allowedValues?: string[], clear: boolean }, deadline?: { date?, time?, timezone? }, quote, page, quoteVerified }`

**CheckResult:** `{ ranAt, inputHash, guidelineHash, findings: Finding[], status, outstanding }`

**Finding:** `{ requirementId, status: 'passed'|'action_needed'|'needs_verification', title, explanation, quote, page, evidence?, measured?: number, correction? }`

`guidelineHash` = a hash of the guideline's page texts joined with explicit page separators, so the same words with different page breaks give a different hash. `contentHash` = a hash of the file's bytes, computed at upload and recomputed on replace. `inputHash` = a hash of `guidelineHash` + every applicant document's (`contentHash`, `confirmedType`) + the applicant facts (see **Status Rules**).

## File Structure

```
build-with-ai-basics/            # repo root = the app
├── app/
│   ├── layout.tsx               # Inter font, page frame, colors
│   ├── globals.css              # Tailwind + small custom transitions
│   ├── page.tsx                 # Dashboard Page
│   ├── applications/[id]/page.tsx   # Single Application Page
│   └── api/
│       ├── parse/route.ts       # Parse Route: PDF → pages, counts (no AI)
│       └── extract/route.ts     # Extract Route: guideline → verified requirements
├── components/
│   ├── ApplicationCard.tsx
│   ├── NewApplicationDialog.tsx
│   ├── DocumentManager.tsx
│   ├── ApplicantInfoForm.tsx
│   ├── RunButton.tsx
│   ├── DisclosureDialog.tsx     # shown before the first upload
│   ├── RequirementsChecklist.tsx # required documents, ticked off as files arrive
│   ├── ResultsPanel.tsx
│   ├── FindingCard.tsx
│   ├── WhatChanged.tsx
│   └── StatusBadge.tsx          # status pill + custom icons
├── lib/
│   ├── types.ts                 # Requirement, Finding, CheckResult…
│   ├── db.ts                    # Storage Layer (Dexie)
│   ├── pdf.ts                   # unpdf helpers: pages, counts, readable
│   ├── docTypes.ts              # Document Type Hints (filename → type)
│   ├── hash.ts                  # SHA-256 fingerprints (content, guideline, inputs)
│   ├── ai/provider.ts           # AI Provider Adapter (interface)
│   ├── ai/gemini.ts             # Gemini implementation
│   ├── quotes.ts                # Quote Verifier
│   ├── checks.ts                # Checker
│   ├── status.ts                # Status Rules + input fingerprint
│   ├── diff.ts                  # What Changed
│   └── runCheck.ts              # Check Orchestrator
├── scripts/
│   ├── make-samples.ts          # generates synthetic demo PDFs
│   └── test-extraction.ts       # early accuracy test vs. expected list
├── samples/                     # synthetic PDFs + expected-requirements.json
├── tests/                       # Vitest: checks, quotes, diff, status
├── devpost/                     # planning docs (scope, prd, spec, checklist)
├── .env.example                 # GEMINI_API_KEY=, GEMINI_MODEL= (no real values)
├── package.json
└── README.md                    # what it is, setup, run, demo steps
```

## External Services and Dependencies

### Google Gemini API (free tier)
- **Docs:** https://ai.google.dev/gemini-api/docs · key and limits: https://aistudio.google.com
- **Auth:** `GEMINI_API_KEY`, read only on the server, from `.env.local`.
- **Calls:**
  - `ai.models.generateContent({ model: GEMINI_MODEL, contents: <prompt + labeled page texts>, config: { temperature: 0, responseMimeType: "application/json", responseSchema: <Requirement[] schema> } })` for extraction.
  - The exact config field names are to be verified against the current SDK.
- **Cost:** $0, free tier only. **Never** configure billing or a paid fallback.
- **Limits:** per-project requests per minute and per day, shown live in AI Studio, and not verified during planning. Usage is small: **one extraction per new guideline**. Uploads and reruns use no AI.
- **Data:** only guideline text is sent. Free-tier inputs may be used by Google to improve its products, so the app discloses this and the demo uses only synthetic documents.

### npm packages
`next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `@google/genai`, `unpdf`, `dexie`, `lucide-react`, `pdf-lib` (scripts), `vitest` (dev), `tsx` (runs the scripts). Use current stable versions at install time, and check that each is maintained.

## Important Failure Modes
- **Free quota exhausted or Gemini unreachable** → "The AI check couldn't run (free quota reached or service unavailable). Your previous results are unchanged. Try again later." No retry storm, and no paid fallback. The demo rerun doesn't depend on Gemini, because the extraction is reused.
- **Gemini returns a wrong or invented quote, or malformed JSON** → the Quote Verifier turns that finding into Needs Verification. Malformed JSON gets one retry, then "The guideline couldn't be analyzed. Try again." with previous results kept.
- **Unreadable or scanned PDF** → the PRD error message, the file stays listed for replacement, it's excluded from checks, and a guideline in this state keeps Run disabled.
- **Browser storage full** → a clear message naming the item that wasn't saved. Nothing is lost silently.

## What Was Simplified and Why
- **Browser storage (IndexedDB)** instead of a database server and accounts. No login is needed for one user on one laptop (learner's choice). The full version needs accounts, a hosted database, file storage, and privacy controls.
- **Extraction cached per guideline** instead of re-asking the AI on every run. Reruns are instant and free, and What Changed compares the same rules both times. A changed guideline triggers a fresh read.
- **The AI only extracts, and code judges.** Results are testable and repeatable (learner's principle). The full version might use AI to judge softer rules like essay sections, which is deferred in the PRD.
- **Eligibility compared only for clearly structured rules** (GPA on the same scale, listed degrees and nationalities). Everything else is Needs Verification. Grading-scale conversion would need trusted conversion tables.
- **Word count = whitespace-separated words in the extracted text.** It's good enough for the limits, though headers and footers may add a few words. A fuller version would let the user exclude sections.
- **Filename-based type hints** instead of AI or content analysis (learner's choice). This means no AI calls on upload, less data sent, and less quota use. A fuller version could also look at first-page keywords in code.
- **Only the latest and previous results are kept**, which is all What Changed needs (`prd.md > Deferred From the POC`).
- **No OCR, PDF only** (learner-approved, `prd.md > Non-Goals`).

## Decisions and Open Issues

**Learner decisions:**
- **Free AI only:** Gemini Flash free tier, behind a swappable adapter. When the quota runs out, it stops gracefully and never uses a paid fallback. Tradeoff accepted: Google may use free-tier inputs, so the demo uses synthetic docs and the app discloses it.
- **JavaScript PDF reading** (unpdf) instead of PyMuPDF, and **no OCR**. Tradeoff: scanned PDFs are rejected.
- **Local app plus a recorded video.** Hosting comes after the MVP.
- **Synthetic demo documents.** The API key lives server-side in `.env.local` only.
- **Disclosure before the first upload** (learner-confirmed). It accurately says only the guideline's text goes to Google, at guideline upload, and that free-tier data may be used.
- **Requirements read at guideline upload** (learner change after the slice 3 review), so the Requirements Checklist appears before the applicant uploads their files. Cached, so Run and reruns make no AI call; Retry on failure; never a paid fallback.
- **Specific next steps instead of generic lines** (learner change after the slice 3 review): facts and suggestions are shown separately and grounded in the quote; deadlines show only the date, time, and timezone the quote states.
- **No AI for document types** (learner change in review): types come from the filename and the user confirms them. Only the guideline goes to Gemini. The PRD was updated to match.
- **Stronger input fingerprint** (learner change in review): it uses content hashes and the page-by-page guideline text, so Outdated appears even when counts are unchanged. Cached requirements are stored together with the exact page texts they were verified against.
- **Build priority:** the demo path first: upload → run → 3-page CV flagged → replace with the 2-page CV → rerun → Action Needed → Passed. Multiple applications and persistence come after, but must not delay it.

**Agent-recommended, learner-accepted:** Next.js + TypeScript, Tailwind, and quote verification in code.

**Implementation details derived from these:** Dexie, extraction caching by guideline fingerprint, Vitest for the logic, pdf-lib for the samples.

**The learner's useful unknown:** "Is a free model good enough at extracting requirements?" **Agreed investigation:** early in the build, run `scripts/test-extraction.ts` on the sample guideline. The bar: every requirement in `expected-requirements.json` is found, and every returned quote is verified. If it falls short: tighten the prompt first, then try another Gemini Flash variant, then consider Groq through the adapter, all still free.

**To verify at build start:** the Gemini model ID and its live free limits in AI Studio; the `@google/genai` JSON-output config names; unpdf's per-page extraction inside a Next.js route.

**Carried from PRD:** none open.
