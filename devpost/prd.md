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
3. **Upload.** On the **Single Application Page**, they upload the official guideline PDF. Before the first upload, they see the AI disclosure. Right after the guideline is uploaded, its text is read by the AI and a **required-documents checklist** appears ("This guideline asks for: …"). They then upload their documents; ApplyProof suggests a type for each file from its filename, the user confirms or changes it, and the checklist ticks each item off as matching files arrive.
4. **Enter facts.** They fill in Applicant Information: GPA, grading scale, degree, nationality.
5. **Run.** They click **Run Readiness Check**. The requirements were already read at upload, so no new AI call is made.
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

### Landing Page (added with the Dream Journal redesign)
- An expressive headline ("Apply with confidence"), an illustrated desk-and-university scene, **Get started** and **How it works** actions, four illustrated workflow steps, and accurate privacy and evidence messaging. The intro plays here on the first visit.

Movement: Landing → Dashboard (`/applications`) ↔ Single Application Page, plus Calendar (`/calendar`). A sidebar (desktop) or top bar (mobile, icons only) links Home, Applications, and Calendar. There are no other screens.

## Look and Feel
"Dream Journal": a warm, illustrated, paper-inspired indie SaaS look that carries the applicant's ambitions while keeping trust, evidence, and usability first (learner's design brief and visual reference, added during the final review).
- **Colors:** oat-paper background #FBF5EB, primary lavender #7861CF, ink text #302B40, lilac #EAE2FF, sage #DDEBDD (passed / ready), butter #FAE9B9 (evidence panels, needs verification), peach #F4D8D0 (action needed), mint #BFE8DE, white cards. Status colors are always paired with a text label.
- **Type:** Fraunces for display headings, DM Sans for all interface text, Caveat only for tiny decorative handwritten notes.
- **Illustration:** hand-drawn-style SVG line art (universities, stars, a paper plane on a dotted flight path, paper clips, notebook ruling) and a faint paper grain. Decorative elements are aria-hidden and never cover controls. Painted artwork from the reference isn't produced; it could be swapped in later.
- **Intro:** a ~6.5-second CSS/SVG opening (paper sheet, handwritten "Every big dream starts somewhere…", university and stars, a plane along a dotted path, then the ApplyProof brand and "Turn requirements into clarity."). It plays once per browser, has **Skip intro**, never plays with reduced motion, and never blocks the app.
- **Results:** warm butter quote panels with the source page, applicant measurements as labeled boxes, and a labeled **Next step**. "Uploaded" in the checklist is lilac with a file icon, visibly different from the green "Passed".
- **Motion:** CSS only (fade/slide, hover lift, a sage pulse and checkmark draw when a finding passes). Respects `prefers-reduced-motion`.
- **Avoid:** generic AI landing-page looks, heavy gradients, glassmorphism, decorative animation that slows the work, cluttered dashboards.

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
  - [ ] The guideline can instead be pasted as text (**Paste guideline text**), for requirements published on a website. Pasting replaces an uploaded guideline PDF and vice versa; there is still one guideline per application. Applicant documents remain PDF uploads.
  - [ ] Empty or very short pasted text (under 30 words) is rejected with "Paste the full guideline text (at least 30 words) so its requirements can be read."
  - [ ] Each applicant file gets a type suggested from its filename (CV, motivation letter, transcript, recommendation letter, other), shown in a dropdown the user can change. No AI is used for this.
  - [ ] If the type is uncertain, ApplyProof asks the user to choose and doesn't pre-select a guess.
  - [ ] Several files can share a type (for example two recommendation letters).
  - [ ] Each file can be replaced or removed, and the list updates immediately.

### Requirement Extraction
Source: `scope.md > The POC Boundary` (extraction and checklist).
- [ ] Uploading the guideline (after the disclosure is accepted) pulls requirements from it: required documents (with counts), page limits, word limits, eligibility rules, deadlines, and formatting rules.
- [ ] Every extracted requirement keeps its exact quote and page number from the guideline.
- [ ] ApplyProof never invents a requirement that has no source passage.
- [ ] The requirements are read once per guideline and reused: running or rerunning a check makes no new AI call.

### Required-Documents Checklist
Added after the slice 3 hands-on review (learner request).
- As an applicant, I want to see what the guideline requires before I upload my files, so that I can track what's still missing as I go.
  - [ ] Right after a readable guideline is uploaded, a checklist lists each required document with its count and any page/word limit ("CV · max 2 pages", "2 recommendation letters").
  - [ ] Each item ticks off as files of that confirmed type are uploaded ("1 of 2"). A tick means uploaded, not that it passes the rules; the readiness check judges that.
  - [ ] Files with no confirmed type aren't counted, and the checklist says so.
  - [ ] If the requirements can't be read (service busy, free quota exhausted), it shows "Couldn't read the requirements yet" with a **Retry** button. No paid fallback.

### Readiness Checks
Each extracted requirement becomes a finding. The finding list is the checklist.
- **Missing documents:** the required count of each type is compared with the confirmed uploads.
  - [ ] With 2 recommendation letters required and 1 uploaded, the finding is **Action Needed** and says "Two required; only one uploaded."
- **Page and word limits:** counts are measured exactly, not estimated by AI.
  - [ ] A 3-page CV against a 2-page limit is **Action Needed** and shows "Official limit: 2 pages · Uploaded CV/résumé: 3 pages."
  - [ ] A 620-word motivation letter against a 500–800 word limit is **Passed**.
- **Basic eligibility:** the user's typed facts are compared with clearly stated rules. **Your details** has GPA, grading scale, **degree level**, **degree status** (completed / in progress), **field of study**, and nationality, entered once and reused by every check.
  - [ ] Degree level and field are compared separately. Equivalent terms count as the same (BSc, B.Sc., Bachelor of Science → bachelor's; CSE, Computer Science, Computer Science and Engineering → the same field family). A higher degree meets a lower requirement.
  - [ ] A subject alone never implies a level. If the level or completion status is unclear (for example "must hold" with no status given), the app asks instead of guessing.
  - [ ] A field not on the list is Needs Verification when the rule also accepts "a related field", otherwise Action Needed.
  - [ ] "Authorized to work in the EU": an EU-country nationality (country or adjective, e.g. Germany / German) passes, since every EU citizen may work in any EU country. Any other nationality is Needs Verification (a permit may exist), never Action Needed; a missing nationality is asked for.
  - [ ] When a check needs a detail that wasn't entered, its card offers **Add missing detail**, which scrolls to, highlights, and focuses that field.
  - [ ] A clearly stated rule the user meets is **Passed**, and one they don't meet is **Action Needed**.
  - [ ] A rule that's ambiguous, or that can't be compared with the facts given (for example a different grading scale with no stated conversion), is **Needs Verification**.
  - [ ] A rule needing a fact the user hasn't entered is **Needs Verification**, and says which field to fill in.
- **Anything not objectively checkable** (formatting, content quality, deadlines) is **Needs Verification**, with its source quote.

### Evidence-Linked Findings
Source: `scope.md > The Unique Kernel`.
- As an applicant, I want to see why each finding was made so that I can trust it and act on it.
  - [ ] For a pasted guideline, the verified quote is labeled **"Pasted guideline"** instead of a page number.
  - [ ] Every finding shows the requirement, a plain explanation, the exact quote from the guideline, and its page number.
  - [ ] Where relevant, it also shows evidence from the applicant's side (for example "Uploaded CV/résumé: 3 pages").
  - [ ] Every Action Needed finding has a recommended correction, and every Needs Verification finding has a specific next step (for example "Upload a revised CV of no more than 2 pages", "Confirm the accepted evidence with the program organizer"). No generic "check it yourself" lines.
  - [ ] Facts (the explanation and evidence) are shown separately from suggestions (labeled **Next step**). Next steps are grounded in the quoted rule and never invent requirements, deadlines, or evidence.
  - [ ] A deadline shows its date, time, and timezone only where the quote states them; a missing closing time or timezone is flagged for verification, never filled in.
  - [ ] No finding is shown without a source quote. **Presentation (learner-approved during the final review):** Action Needed and Needs Verification always show the quote. Passed findings are compact checklist rows, with the quote and evidence one click away, never removed.
  - [ ] Action Needed findings are numbered fix-first cards ("Fix this first" on the top one), with a visual limit meter where there's a measured value and a **Replace file** / **Upload file** action for document-related findings. Needs Verification findings are sticky-note cards led by the Next step. Every finding shows an icon for its requirement type (document, length limit, eligibility, deadline).

### Fix-First Results
- [ ] The groups appear in this order: **Action Needed** (expanded), **Needs Verification** (expanded when it has items), **Passed** (collapsed).
- [ ] Each group header shows its count, and every group can be expanded or collapsed.
- [ ] The overall status in the header and on the dashboard card is Action Needed if any Action Needed findings exist, otherwise Needs Verification if any exist, otherwise Passed.
- [ ] If no check has completed successfully yet, the status is **Not Checked**.
- [ ] The status is never Passed while any required criterion is still unverified.

### Application Tracking
Added after the final review began (learner request). Separate from readiness: where the application stands.
- [ ] Each application shows **Not submitted · due in N days** (butter-yellow within 7 days, "due today" on the day), **Submitted · date**, **Missed · was due date**, or **No deadline set**, on its page and its dashboard card.
- [ ] **Mark as submitted** records today's date; **Undo submitted** reverses it. A missed application can still be marked submitted.
- [ ] The deadline can be entered or changed on the application page. If none was entered, it's filled from the guideline's deadline, but only when that date appears word for word in the verified quote.
- [ ] The dashboard can filter by **Submitted** and **Missed**. Readiness tabs (Action Needed, Needs Verification, Ready to submit, Not Checked) list only applications still in progress; a submitted application shows its readiness as "Last check: …".
- [ ] Days are compared in the user's local time; the guideline's own timezone isn't applied.

### Deadline Reminders
Added during the final review (learner request). Local and free: no emails, push, or server.
- [ ] A **Due soon** banner on the dashboard lists unsubmitted applications that are overdue, due today, or due within 7 days, most urgent first, each linking to its application. Submitted applications never appear.
- [ ] **Hide until tomorrow** hides it for today only, and a newly urgent application brings it back; the cards' deadline pills always stay visible.
- [ ] **Add to calendar** on each unsubmitted application with a deadline downloads a standard .ics file (Google Calendar, Outlook, Apple Calendar) with reminders 7 days and 1 day before.
- [ ] A date-only deadline becomes an all-day event. A time and timezone are used only when the guideline states them (verified in its quote) and the deadline date still matches the guideline's; they're converted exactly (23:59 CET → 22:59 UTC). An unknown timezone falls back to all-day, never an invented time.

### Calendar
Added during the final review (learner request, kept small).
- [ ] A **Calendar** item in the navigation opens a monthly calendar (weeks start Monday) with each application's deadline on its date, color-coded with a legend: upcoming (lilac), due within 7 days (butter), missed (red), submitted (green).
- [ ] Clicking a date lists the applications due that day; each opens its application. Previous / Next month and **Today**.
- [ ] **Upcoming deadlines** below lists unsubmitted applications due today or later, soonest first.
- [ ] The exact time (for example "23:59 CET") shows only when the guideline states it and the deadline date still matches it.
- [ ] Local only, no AI calls. The Due soon banner and Add to calendar stay as they are.

### Confirmed by You
Added during the final review (learner request), for rules ApplyProof can't verify (for example "strong English proficiency").
- [ ] Each Needs Verification finding offers **Mark as confirmed** with an optional short note (for example "IELTS 7.0 certificate ready").
- [ ] A confirmed finding moves to its own **Confirmed by you** group (between Needs Verification and Passed), with the date, the note, the requirement, quote, evidence, and Next step. It's styled differently from Passed and says ApplyProof didn't verify it.
- [ ] The note can be edited and the confirmation undone. No AI calls.
- [ ] **Readiness summary (learner decision, replacing the earlier "never Ready"):** confirmed items leave the outstanding count and are reported separately ("2 outstanding · 1 confirmed by you"). When everything is either Passed or confirmed, the status reads **Ready to submit · N confirmed by you**, never plain verified. The stored check result itself is never changed.
- [ ] Submission tracking stays separate: a Submitted application keeps its readiness summary, and a confirmed item isn't shown as pending.
- [ ] A confirmation applies only to the same quoted rule; if the guideline changes the rule's wording, it no longer applies.

### Recheck and What Changed
Source: `scope.md > What "Working" Looks Like` (the "oh, that's cool" beat).
- As an applicant, I want to see what my fix changed so that I know my correction worked.
  - [ ] After replacing a file or editing applicant info, the user can rerun the check.
  - [ ] When a previous check exists, a **What Changed since your last check** summary appears at the top of the results. It lists status changes (for example "CV length: Action Needed → Passed"), measured value changes ("CV pages: 3 → 2"), and the outstanding-issue count change ("3 → 2").
  - [ ] Only changes that can be matched reliably between the two checks are listed, and nothing is claimed as improved if it can't be compared.
  - [ ] Unresolved issues stay visible below the summary.
  - [ ] A finding changing to Passed gets a satisfying visual transition.

### AI Disclosure
- [ ] Before the first upload in an application, the user is told that when the guideline is uploaded, its text is sent to Google's Gemini API to extract requirements, and that on the free tier Google may use this data to improve its products. Applicant documents are never sent. They can proceed or cancel.

## States and Boundaries
- **First use (empty dashboard):** a friendly empty state explains what ApplyProof does, with a **+ New Application** button.
- **New application, nothing uploaded:** the Documents and Applicant Information sections are empty, and the Run button is disabled with the hint "Upload an official application guideline first."
- **Run clicked without a guideline:** the button stays disabled. If it's somehow triggered, the message is "Upload an official application guideline first."
- **Unreadable PDF:** the message is "We couldn't extract readable text from this PDF. It may be scanned or image-based." It suggests uploading a text-readable PDF and keeps the file visible so it can be replaced. No checks run against unreadable content, and nothing is extracted from it.
- **Unreadable guideline:** treated like a missing guideline. The Run button stays disabled until a readable one is uploaded.
- **Requirements can't be read yet:** the checklist shows "Couldn't read the requirements yet" with a Retry button. Run still works later (it retries the read).
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
- **Requirements are read at guideline upload, not at Run:** so the user sees the required-documents checklist before uploading their files (learner change after the slice 3 review). Still only the guideline's text, still only after the disclosure, and cached so Run and reruns make no AI call.
- **Only the guideline goes to the AI, after disclosure:** applicant documents stay on the device, and the user is told before the first upload what is sent and how free-tier data may be used.
- **Visual identity is colorful and premium but evidence-first:** see Look and Feel.
- **The demo path comes first:** upload the guideline and documents → run the check → the 3-page CV is flagged against the 2-page limit → upload the corrected CV → rerun → What Changed shows Action Needed → Passed. The learner asked to put this flow ahead of secondary features.
- **Multiple applications and persistence are kept if feasible:** they stay in the MVP, but must not delay the core demo path.

## What We're Building
Build priority: the demo path first (see Product Decisions), then everything else.

- Application Dashboard with cards, statuses, issue counts, and New Application
- Single Application Page: header, Documents, Applicant Information, Results
- PDF upload, with file types suggested from the filename and confirmed by the user
- Required-documents checklist shown right after the guideline is read, ticking off uploads
- Guideline as a PDF upload or pasted text
- Requirement extraction with quotes and page numbers
- Missing-document, page-limit, and word-limit checks
- Basic eligibility check against typed-in facts
- Evidence-linked findings in three fix-first groups
- Dream Journal visual design: landing page with a one-time intro, illustrated dashboard cards with filters, a four-step progress tracker in the application workspace
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
- **Supporting non-PDF uploads (Word, images) or OCR of scanned PDFs:** the MVP accepts PDFs, plus pasted text for the guideline only (added after the final review began, learner request), and a scanned PDF gets a clear error asking for a text-readable PDF.

## Open Questions
None. The four review assumptions were confirmed and clarified by the learner: the overall status rule, the Outdated notice, keeping results after a failed check, and PDF-only uploads.
