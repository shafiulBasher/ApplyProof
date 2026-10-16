// Generates clearly synthetic demo PDFs in samples/. Run: npm run samples
import { mkdirSync, writeFileSync } from "node:fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const OUT = "samples";
const NOTE = "SYNTHETIC SAMPLE - created for the ApplyProof demo. All names and details are fictional.";

// Each inner array is one page; each string is a paragraph.
async function makePdf(file: string, pages: string[][]) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const size = 11, lineH = 15, margin = 60, width = 612 - margin * 2;
  for (const paragraphs of pages) {
    const page = doc.addPage([612, 792]);
    let y = 792 - margin;
    for (const para of paragraphs) {
      let line = "";
      for (const word of para.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) > width) {
          page.drawText(line, { x: margin, y, size, font, color: rgb(0.1, 0.1, 0.2) });
          y -= lineH;
          line = word;
        } else line = next;
      }
      if (line) page.drawText(line, { x: margin, y, size, font, color: rgb(0.1, 0.1, 0.2) });
      y -= lineH * 1.6;
      if (y < margin) throw new Error(`${file}: page overflow`);
    }
  }
  writeFileSync(`${OUT}/${file}`, await doc.save());
}

const filler = (n: number, seed: string) =>
  Array.from({ length: n }, (_, i) => seed.split(" ")[i % seed.split(" ").length]).join(" ");

const cvPage = (title: string) => [
  title,
  "Experience: research assistant at a fictional university lab, coordinating survey studies, cleaning data, and presenting weekly findings to the team.",
  "Projects: built a small water-quality dashboard for a student club; organized a peer tutoring program with twenty volunteers across two semesters.",
  "Skills: data analysis, technical writing, public speaking, project coordination, and basic programming.",
];

const LETTER_SEED =
  "I am applying because I want to study sustainable engineering and bring practical solutions back to my community where clean water and reliable energy remain everyday challenges";

async function main() {
  mkdirSync(OUT, { recursive: true });

  await makePdf("guideline.pdf", [
    [
      "Global Future Scholars Scholarship 2027 - Application Guidelines",
      NOTE,
      "The Global Future Scholars Scholarship supports students who want to pursue a master's degree in engineering, science, or public policy. Selection is based on academic merit and the quality of the full application.",
      "Eligibility",
      "Applicants must hold a bachelor's degree, or expect to complete one before the program starts.",
      "Applicants must have a minimum GPA of 3.0 on a 4.0 scale.",
      "Applicants must demonstrate strong English proficiency.",
    ],
    [
      "Required Documents",
      "Every application must include the following documents. Incomplete applications will not be reviewed.",
      "A curriculum vitae (CV) of no more than 2 pages.",
      "A motivation letter of between 500 and 800 words.",
      "An official academic transcript.",
      "Two letters of recommendation from academic or professional referees.",
    ],
    [
      "Submission",
      "The application deadline is October 20, 2027, at 23:59 CET. Late applications will not be accepted.",
      "Shortlisted applicants will be invited to an online interview. Results are announced by email.",
      NOTE,
    ],
  ]);

  await makePdf("cv-3-pages.pdf", [cvPage("Alex Rivera - Curriculum Vitae (page 1)"), cvPage("Alex Rivera - CV (page 2)"), cvPage("Alex Rivera - CV (page 3)")]);
  await makePdf("cv-2-pages.pdf", [cvPage("Alex Rivera - Curriculum Vitae (page 1)"), cvPage("Alex Rivera - CV (page 2)")]);

  const head = "Motivation Letter - Alex Rivera";
  const body = filler(620 - head.split(" ").length - NOTE.split(" ").length, LETTER_SEED);
  const bodyWords = body.split(" ");
  await makePdf("motivation-letter.pdf", [
    [head, NOTE, bodyWords.slice(0, 380).join(" ")],
    [bodyWords.slice(380).join(" ")],
  ]);

  await makePdf("transcript.pdf", [[
    "Official Academic Transcript - Alex Rivera",
    NOTE,
    "Bachelor of Science in Environmental Engineering. Cumulative GPA: 3.6 on a 4.0 scale.",
    "Courses: Fluid Mechanics (A), Water Treatment (A-), Statistics (B+), Thermodynamics (A), Technical Writing (A).",
  ]]);

  await makePdf("recommendation-1.pdf", [[
    "Letter of Recommendation for Alex Rivera",
    NOTE,
    "I have supervised Alex as a research assistant for two years. Alex is reliable, curious, and communicates findings clearly. I recommend Alex without reservation.",
  ]]);

  // Extra test files: a second letter (fixes the letter count), a too-short letter, an unclear filename.
  await makePdf("recommendation-2.pdf", [[
    "Letter of Recommendation for Alex Rivera",
    NOTE,
    "I taught Alex in two engineering courses. Alex consistently delivered careful, well-organized work and helped classmates understand difficult material.",
  ]]);
  await makePdf("motivation-letter-short.pdf", [[head, NOTE, filler(300, LETTER_SEED)]]);
  await makePdf("my-document.pdf", [cvPage("Alex Rivera - Curriculum Vitae")]);

  // Job application set (samples/job/): a fictional posting with a 1-page resume limit,
  // a deadline with no closing time, and two references required.
  mkdirSync(`${OUT}/job`, { recursive: true });
  const JOB_NOTE = "SYNTHETIC SAMPLE - Northwind Analytics is a fictional company created for the ApplyProof demo.";
  await makePdf("job/job-posting.pdf", [
    [
      "Junior Data Analyst - Northwind Analytics (Berlin, hybrid)",
      JOB_NOTE,
      "Northwind Analytics helps public transport operators understand ridership. As a Junior Data Analyst you will clean data, build dashboards, and present findings to city partners.",
      "Who can apply",
      "Candidates must hold a bachelor's degree in statistics, economics, computer science, or a related field.",
      "Candidates must be legally authorized to work in the European Union.",
    ],
    [
      "How to apply",
      "Please send the following documents. Applications missing any document will not be considered.",
      "A resume of no more than 1 page.",
      "A cover letter of between 250 and 400 words explaining why you want this role.",
      "Two professional references.",
      "Submit all documents as PDF files.",
      "Applications close on November 30, 2026.",
      JOB_NOTE,
    ],
  ]);
  const resumePage = (title: string) => [
    title,
    "Experience: data intern at a fictional transit agency, cleaning ticketing data and building weekly ridership reports in SQL and Python.",
    "Education: Bachelor of Science in Economics, fictional state university.",
    "Skills: SQL, Python, spreadsheet modeling, dashboard design, clear written reports.",
  ];
  await makePdf("job/resume-2-pages.pdf", [resumePage("Sam Okafor - Resume (page 1)"), resumePage("Sam Okafor - Resume (page 2)")]);
  await makePdf("job/resume-1-page.pdf", [resumePage("Sam Okafor - Resume")]);
  const COVER_SEED = "I would love to join Northwind Analytics because turning messy ridership data into clear decisions for city partners is exactly the work I enjoy most";
  const coverHead = "Cover Letter - Sam Okafor";
  await makePdf("job/cover-letter.pdf", [[coverHead, JOB_NOTE, filler(320 - coverHead.split(" ").length - JOB_NOTE.split(" ").length, COVER_SEED)]]);
  for (const [file, who] of [["job/reference-1.pdf", "my manager during the transit internship"], ["job/reference-2.pdf", "Sam's thesis supervisor"]]) {
    await makePdf(file, [[
      "Professional Reference for Sam Okafor",
      JOB_NOTE,
      `Written by ${who}. Sam is careful with data, asks good questions, and explains results clearly to non-technical colleagues. I recommend Sam for an analyst role.`,
    ]]);
  }

  // A PDF with no text layer, to exercise the "unreadable" path.
  const blank = await PDFDocument.create();
  blank.addPage([612, 792]).drawRectangle({ x: 100, y: 300, width: 400, height: 200, color: rgb(0.8, 0.8, 0.8) });
  writeFileSync(`${OUT}/scanned-unreadable.pdf`, await blank.save());

  console.log("Samples written to samples/");
}

main();
