# ApplyProof

**Know what's missing before you submit.** ApplyProof checks your real application files against the official guideline and shows what passed, what needs fixing, and what can't be verified. Every finding quotes the guideline, with its page number.

- Upload the official guideline. A checklist of required documents appears right away.
- Upload your CV, letters, and transcript. They're read on your own computer and never sent anywhere.
- Run the readiness check. Findings are grouped fix-first: **Action Needed**, **Needs Verification**, **Passed**.
- Fix a file, rerun, and **What Changed** shows what your fix resolved (for example "CV length: Action Needed → Passed").

Page and word counts, document counts, and eligibility comparisons are done by plain code. The AI (Google Gemini, free tier) only reads the guideline and lists its requirements. Code then checks that every quote really appears in the guideline, and anything it can't confirm is marked **Needs Verification**.

## Setup

You need Node.js 22 and a free Gemini API key from [Google AI Studio](https://aistudio.google.com). Don't enable billing on that project; ApplyProof only uses the free tier.

```bash
npm install
cp .env.example .env.local     # then put your key in GEMINI_API_KEY
npm run samples                # creates the synthetic demo PDFs in samples/
npm run dev                    # open http://localhost:3000
```

`GEMINI_MODEL` takes a comma-separated list of free Flash models. If one is busy or out of quota, the next one is tried once. There's never a paid fallback.

`.env.local` is git-ignored. Never commit your key.

## Try the demo

1. Open http://localhost:3000 (a short intro plays once; **Skip intro** is top right), click **Get started**, then **+ New Application**, and name it "Global Future Scholars Scholarship". (Guidelines can also be pasted as text: try **Paste guideline text** with `samples/job/job-posting.txt`.)
2. Upload `samples/guideline.pdf` and accept the disclosure. The checklist of required documents appears.
3. Add `cv-3-pages.pdf`, `motivation-letter.pdf`, `transcript.pdf`, and `recommendation-1.pdf`, and watch the checklist tick off.
4. Enter GPA `3.6` on a `4` scale and the degree `Bachelor of Science`, then click **Run Readiness Check**.
   The CV is **Action Needed**: "Official limit: 2 pages · Uploaded CV/résumé: 3 pages", with the guideline's quote and page.
5. Replace the CV with `cv-2-pages.pdf`. The results are marked **Outdated**.
6. Rerun. It's instant, with no AI call, and **What Changed** shows "CV length: Action Needed → Passed".

All sample documents are fictional.

## Privacy

- Only the guideline's text is sent to Google, after you accept the disclosure. On the free tier, Google may use it to improve its products.
- Your own documents and details stay in this browser (IndexedDB). Clearing your browser data removes them.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the app at http://localhost:3000 |
| `npm test` | Unit tests for the checker, quote verifier, What Changed, and fingerprints |
| `npm run test:extraction` | Live accuracy test: extracts the sample guideline and compares it with `samples/expected-requirements.json` (uses one free Gemini request) |
| `npm run samples` | Regenerate the synthetic sample PDFs |

Built with Next.js, TypeScript, Tailwind CSS, Dexie, unpdf, and `@google/genai`. Planning documents are in `devpost/`.
