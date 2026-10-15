---
doc: prd
status: approved
---

# ApplyProof — Product Requirements

ApplyProof is a readiness checker for applicants preparing scholarship, program, fellowship, or job applications. It compares an application's official guideline with the applicant's actual files and shows what passed, what needs fixing, and what can't be verified, with evidence for every finding.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. **Arrive.** The user opens ApplyProof and sees the **Application Dashboard**. On first use it's empty, with a prompt to create an application.
2. **Create.** They click **+ New Application** and enter the program name (required), plus the university/organization and deadline (optional). The new application opens.
3. **Upload.** On the **Single Application Page**, they upload the official guideline PDF and their documents. ApplyProof suggests a type for each file from its filename, and the user confirms or changes it. Before the first upload, they see the AI disclosure.
4. **Enter facts.** They fill in Applicant Information: GPA, grading scale, degree, nationality.
5. **Run.** They click **Run Readiness Check**. Only the official guideline's text goes to the AI service.
6. **Read results.** Findings appear grouped fix-first: **Action Needed**, then **Needs Verification**, then **Passed** (collapsed). Each finding shows the requirement, an explanation, the exact quote and source page, and a recommended correction where applicable.
7. **Fix.** They replace a document (for example a 3-page CV with a 2-page version) or update their applicant info.
8. **Rerun.** They run the check again. A **What Changed** summary appears at the top, for example "CV length: Action Needed → Passed".
9. **Success.** The user can see exactly what's resolved, what remains, and what they must verify themselves. Back on the dashboard, the card shows the new status and issue count.

## Screens and Layout

### Application Dashboard
- A list of application cards. Each card shows:
  - program name and university/organization
  - deadline, if provided
  - readiness status: Not Checked / Passed / Action Needed / Needs Verification
  - number of outstanding issues
- A prominent **+ New Application** button.
- Clicking a card opens its Single Application Page.

### Single Application Page
Organized top to bottom:
1. **Header:** program name, deadline, current readiness status, and the **Run Readiness Check** button.
2. **Documents:** an upload area for the official guideline and the applicant's files. Each file shows its name, confirmed type, and options to replace or remove it.
3. **Applicant Information:** a simple form for GPA, grading scale, degree, and nationality.
4. **Results:** appears after the first check. If there was a previous check, the **What Changed** summary comes first, followed by the grouped findings.

Movement: Dashboard ↔ Single Application Page. There are no other screens.

## Look and Feel
"Colorful and memorable on the surface, precise and trustworthy at the core." A premium indie-hacker SaaS aesthetic: bold, modern, energetic, polished.
- **Colors:** deep navy, electric blue or violet, mint green, and warm off-white. **Amber** = Needs Verification, **muted red** = Action Needed, **mint green** = Passed.
- **Typography:** Inter or a similar modern sans-serif, with bold headings and a clear hierarchy.
- **Dashboard:** distinctive application cards, colorful status indicators, compact progress visuals, and a prominent New Application button.
- **Results:** clean and evidence-focused. Highlighted source passages, findings that are easy to scan, and clear next actions.
- **Interactions:** smooth transitions when results change, subtle hover effects, and a satisfying status transition when a corrected document passes.
- **Identity:** subtle gradients, tasteful accent colors, custom icons, and selective use of rounded cards.
- **Avoid:** generic AI landing-page looks, excessive gradients, glassmorphism everywhere, unnecessary animation, and cluttered dashboards.

## Features and Behavior

### Application Management
Source: `scope.md > The POC Boundary` (multiple applications).
- As an applicant, I want to keep several applications separate so that each one's files and results stay with it.
  - [ ] Clicking **+ New Application** asks for a program name (required) and the university/organization and deadline (optional). An application can't be created without a name.
  - [ ] Every created application appears as a card on the dashboard.
  - [ ] Opening a card shows only that application's files, applicant info, and results.
  - [ ] A new application's card shows the status **Not Checked**.

### Document Upload and Identification
- As an applicant, I want ApplyProof to recognize my files but let me have the final word, so that the document checks count the right things.
  - [ ] PDFs can be uploaded as the official guideline or as applicant documents.
  - [ ] Each applicant file gets a type suggested from its filename (CV, motivation letter, transcript, recommendation letter, other), shown in a dropdown the user can change. No AI is used for this.
  - [ ] If the type is uncertain, ApplyProof asks the user to choose and doesn't pre-select a guess.
  - [ ] Several files can share a type (for example two recommendation letters).
  - [ ] Each file can be replaced or removed, and the list updates immediately.

### Requirement Extraction
Source: `scope.md > The POC Boundary` (extraction and checklist).
- [ ] Running a check pulls requirements from the guideline: required documents (with counts), page limits, word limits, eligibility rules, deadlines, and formatting rules.
- [ ] Every extracted requirement keeps its exact quote and page number from the guideline.
- [ ] ApplyProof never invents a requirement that has no source passage.

### Readiness Checks
Each extracted requirement becomes a finding. The finding list is the checklist.
- **Missing documents:** the required count of each type is compared with the confirmed uploads.
  - [ ] With 2 recommendation letters required and 1 uploaded, the finding is **Action Needed** and says "Two required; only one uploaded."
- **Page and word limits:** counts are measured exactly, not estimated by AI.
  - [ ] A 3-page CV against a 2-page limit is **Action Needed** and shows "Official limit: 2 pages · Uploaded CV: 3 pages."
  - [ ] A 620-word motivation letter against a 500–800 word limit is **Passed**.
- **Basic eligibility:** the user's typed facts are compared with clearly stated rules.
  - [ ] A clearly stated rule the user meets is **Passed**, and one they don't meet is **Action Needed**.
  - [ ] A rule that's ambiguous, or that can't be compared with the facts given (for example a different grading scale with no stated conversion), is **Needs Verification**.
  - [ ] A rule needing a fact the user hasn't entered is **Needs Verification**, and says which field to fill in.
- **Anything not objectively checkable** (formatting, content quality, deadlines) is **Needs Verification**, with its source quote.

### Evidence-Linked Findings
Source: `scope.md > The Unique Kernel`.
- As an applicant, I want to see why each finding was made so that I can trust it and act on it.
  - [ ] Every finding shows the requirement, a plain explanation, the exact quote from the guideline, and its page number.
  - [ ] Where relevant, it also shows evidence from the applicant's side (for example "Uploaded CV: 3 pages").
  - [ ] Every Action Needed finding has a recommended correction.
  - [ ] No finding is shown without a source quote.

### Fix-First Results
- [ ] The groups appear in this order: **Action Needed** (expanded), **Needs Verification** (expanded when it has items), **Passed** (collapsed).
- [ ] Each group header shows its count, and every group can be expanded or collapsed.
- [ ] The overall status in the header and on the dashboard card is Action Needed if any Action Needed findings exist, otherwise Needs Verification if any exist, otherwise Passed.
- [ ] If no check has completed successfully yet, the status is **Not Checked**.
- [ ] The status is never Passed while any required criterion is still unverified.

### Recheck and What Changed
Source: `scope.md > What "Working" Looks Like` (the "oh, that's cool" beat).
- As an applicant, I want to see what my fix changed so that I know my correction worked.
  - [ ] After replacing a file or editing applicant info, the user can rerun the check.
  - [ ] When a previous check exists, a **What Changed since your last check** summary appears at the top of the results. It lists status changes (for example "CV length: Action Needed → Passed"), measured value changes ("CV pages: 3 → 2"), and the outstanding-issue count change ("3 → 2").
  - [ ] Only changes that can be matched reliably between the two checks are listed, and nothing is claimed as improved if it can't be compared.
  - [ ] Unresolved issues stay visible below the summary.
  - [ ] A finding changing to Passed gets a satisfying visual transition.

### AI Disclosure
- [ ] Before the first upload in an application, the user is told that when a check runs, the official guideline's text is sent to Google's Gemini API to extract requirements, and that on the free tier Google may use this data to improve its products. Applicant documents are never sent. They can proceed or cancel.

## States and Boundaries
- **First use (empty dashboard):** a friendly empty state explains what ApplyProof does, with a **+ New Application** button.
- **New application, nothing uploaded:** the Documents and Applicant Information sections are empty, and the Run button is disabled with the hint "Upload an official application guideline first."
- **Run clicked without a guideline:** the button stays disabled. If it's somehow triggered, the message is "Upload an official application guideline first."
- **Unreadable PDF:** the message is "We couldn't extract readable text from this PDF. It may be scanned or image-based." It suggests uploading a text-readable PDF and keeps the file visible so it can be replaced. No checks run against unreadable content, and nothing is extracted from it.
- **Unreadable guideline:** treated like a missing guideline. The Run button stays disabled until a readable one is uploaded.
- **Check in progress:** a clear progress indicator, and the Run button can't be clicked twice.
- **Inputs changed since the last check:** whenever the guideline, a supporting document, or the applicant info changes after the last successful check, a clear notice appears, and the previous results are labeled **Outdated** until the user reruns.
- **Check fails (for example the AI service is unreachable):** the previous successful results are kept, not overwritten, and the error is shown separately. If the inputs have changed, the Outdated notice stays so the user knows the results don't reflect their latest files.
- **Persistence:** applications, uploaded files, applicant info, the latest results, and the previous results are all still there after closing and reopening ApplyProof on the same browser and device. The user is told that clearing browser data removes them.
- **Persistence fallback:** if ApplyProof can't save something, for example a file too large to store, the user is told clearly, before they leave, that this item won't be kept. It's never lost silently.
- **Boundary:** single user, one device, no login. Data is not shared or synced.

## Product Decisions
- **Filename-based type suggestion, the user confirms:** no AI calls on upload, less data sent to Google, and less dependence on free-tier quotas. The app asks rather than guesses when unsure. This was changed during `4-spec` from the AI-based suggestion.
- **Eligibility facts are typed in by the user:** reading them from the CV is too error-prone (`scope.md > Explicitly Cut`).
- **Page and word counts are measured exactly in code, not by AI:** results are testable and reliable (learner's stated technical principle).
- **Fix-first ordering, with Passed collapsed:** this keeps attention on what needs fixing.
- **What Changed only claims changes it can support:** an honest before-and-after is the main demo moment.
- **Run is disabled until a readable guideline exists:** there's nothing to check against without one.
- **Work persists on the device without login:** the MVP is single-user, and login comes right after the MVP (`scope.md > Later`). The learner prefers browser-local storage, which is passed to `4-spec`.
- **Only the guideline goes to the AI, after disclosure:** applicant documents stay on the device, and the user is told before the first upload what is sent and how free-tier data may be used.
- **Visual identity is colorful and premium but evidence-first:** see Look and Feel.
- **The demo path comes first:** upload the guideline and documents → run the check → the 3-page CV is flagged against the 2-page limit → upload the corrected CV → rerun → What Changed shows Action Needed → Passed. The learner asked to put this flow ahead of secondary features.
- **Multiple applications and persistence are kept if feasible:** they stay in the MVP, but must not delay the core demo path.

## What We're Building
Build priority: the demo path first (see Product Decisions), then everything else.

- Application Dashboard with cards, statuses, issue counts, and New Application
- Single Application Page: header, Documents, Applicant Information, Results
- PDF upload, with file types suggested from the filename and confirmed by the user
- Requirement extraction with quotes and page numbers
- Missing-document, page-limit, and word-limit checks
- Basic eligibility check against typed-in facts
- Evidence-linked findings in three fix-first groups
- Recheck with a What Changed summary
- AI disclosure, empty and error states, persistence on the device

## Deferred From the POC
- **Sign-up and login for many applicants:** a single user is enough to prove the check. It comes right after the MVP works (`scope.md > Later`).
- **Sync across devices and backups:** this needs accounts, so data stays on one browser for now.
- **Full history of every check:** only the latest and previous results are kept, which is all What Changed needs.
- **Exportable readiness report:** it isn't needed to prove the loop (`scope.md > Later`).

## Possible Later Enhancements
- Official source monitoring, to alert when requirements change (the learner's key future differentiator).
- Conflict detection across the guide, FAQ, and web page.
- Checking for required sections in the CV and essay.
- Deadline tracker and reminders, recommendation-letter tracker.
- Reusable applicant profile shared across applications.
- Counselor dashboard and collaboration.
- OCR support for scanned or image-based PDFs.

## Non-Goals
- **Finding programs, jobs, or scholarships:** ApplyProof checks applications, it doesn't find them.
- **Writing or rewriting essays or CVs:** it checks documents, and it doesn't produce them.
- **Predicting admission or success:** it promises readiness, not outcomes.
- **Reading eligibility facts out of the CV:** the user enters them.
- **Judging writing quality:** quality isn't objectively verifiable, so it's out.
- **Supporting non-PDF uploads (Word, images) or OCR of scanned PDFs:** the MVP is PDF-only, and a scanned PDF gets a clear error asking for a text-readable PDF.

## Open Questions
None. The four review assumptions were confirmed and clarified by the learner: the overall status rule, the Outdated notice, keeping results after a failed check, and PDF-only uploads.
