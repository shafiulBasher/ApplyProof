---
doc: scope
status: approved
---

# ApplyProof

Know what's missing before you submit. A readiness checker that compares an application's official rules with the applicant's actual files and shows what passes, what needs fixing, and what can't be verified.

## The Unique Kernel
ApplyProof checks the **applicant's real files** against the **official rules**, and every finding shows its evidence: the exact rule, a quote, and the source page. When it can't confirm something, it says "Needs Verification" instead of guessing. The kernel is the evidence-linked check, not the checklist.

## Who It's For
Anyone preparing an application with official instructions and several required documents: students applying to scholarships, master's programs, and fellowships, and job applicants. They want to recheck every requirement and eligibility criterion before submitting. Today they compare the guide against their files by hand, maybe with a spreadsheet, and hope nothing slipped.

The proof of concept is built around one picturable person: a student with a scholarship package (guideline PDF, CV, motivation letter, transcript, recommendation letter) who is about to submit. The learner is applying to programs themselves and is a target user.

## The Core Loop
Open an application, upload the guideline and documents, run the readiness check, read the findings (fix-first), fix a document, re-upload, and rerun until it's ready. They come back for each new application, and whenever they revise a file.

## Inspiration & Identity
Trustworthy and precise rather than flashy. Every claim is backed by a source. Clear statuses: Passed / Action Needed / Needs Verification.
- Related products the learner named: Vidicy (AI visa document review, https://vidicy.com/), Kaleidoscope (scholarship tracking, https://www.mykaleidoscope.com), Continua (requirements checklists with citations, https://askcontinua.com).
- Their differentiation: official rules + real files + verifiable evidence + prioritized corrections.

## Why This Matters to the Learner
They are about to apply to several programs themselves, and want something that helps "others like me" too.

## What "Working" Looks Like
In the learner's words: "The user opens ApplyProof, uploads an official application guideline and their application documents, and clicks 'Run Readiness Check.' ApplyProof generates a checklist, identifies missing documents and rule violations, and links each finding to the exact source passage. The user fixes an issue, uploads the corrected document, and reruns the check to see the status change, proving ApplyProof works end to end."

**The "oh, that's cool" beat:** the 3-page CV is flagged "Action Needed" with the 2-page rule quoted from the guideline. The user uploads a 2-page version, reruns, and it flips to "Passed."

## The POC Boundary
- **Multiple applications:** one user (no login yet) with a list of applications, each with its own documents and results (the learner chose to keep this in).
- **Upload:** PDF upload of one official guideline plus the applicant's documents.
- **Extraction and checklist:** AI extracts the requirements (required documents, page and word limits, eligibility rules, deadlines, formatting) into a checklist.
- **Missing documents:** detects required documents that weren't uploaded.
- **Measurable checks:** page and word limits are checked with plain code, not AI.
- **Basic eligibility:** the user types key facts (GPA, degree, nationality), which are compared with clearly stated rules. Ambiguous rules are marked Needs Verification. Nothing is read from the CV.
- **Evidence:** every finding shows the rule, a quote, and the source page.
- **Unable to verify:** anything that can't be confirmed is marked Needs Verification.
- **Fix-first:** findings are ordered by what needs attention first.
- **Recheck:** re-upload a corrected file and rerun to see statuses update.
- **Status view:** Passed / Action Needed / Needs Verification.

## Later
- **Accounts for many applicants (sign-up and login):** each applicant has their own private account and applications. The learner's chosen direction, to be built right after the MVP works. The proof of concept runs as a single user.
- Official source monitoring, to notify when requirements, eligibility, or deadlines change. The learner sees this as a key trust differentiator, but it adds too much complexity for now.
- Conflict detection across documents (guide vs. FAQ vs. web page)
- Exportable readiness report
- Checking for required sections in the CV and essay (AI-judged, softer than counts)
- Deadline tracker, reminders, recommendation-letter tracker, progress tracker
- Reusable applicant profile, version comparison, application history
- Collaboration, counselor dashboard, privacy controls
- Premium tiers and payments

## Explicitly Cut
- **Finding programs, jobs, or scholarships (discovery):** ApplyProof is for checking applications, not finding them, and a reliable database is a separate, much bigger problem.
- **Essay writing and generation:** it checks documents, it doesn't write them.
- **Admission or success prediction:** it promises readiness, not outcomes.
- **Reading eligibility facts out of the CV:** too error-prone for now, so the user enters them by hand.
