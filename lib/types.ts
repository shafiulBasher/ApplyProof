export type DocType = "cv" | "motivation_letter" | "transcript" | "recommendation_letter" | "other";

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  cv: "CV / Résumé",
  motivation_letter: "Motivation / cover letter",
  transcript: "Transcript",
  recommendation_letter: "Recommendation / reference letter",
  other: "Other",
};

export interface ApplicantFacts {
  gpa?: number;
  gpaScale?: number;
  degree?: string;
  nationality?: string;
}

export interface Application {
  id: string;
  name: string;
  organization?: string;
  deadline?: string;
  applicant: ApplicantFacts;
  disclosureAccepted: boolean;
  createdAt: number;
}

export interface ParsedPdf {
  pages: string[];
  pageCount: number;
  wordCount: number;
  readable: boolean;
}

export interface StoredDocument extends ParsedPdf {
  id: string;
  applicationId: string;
  role: "guideline" | "applicant";
  // A guideline can be a PDF or pasted text (one "page", no page numbers).
  source?: "pdf" | "pasted";
  fileName: string;
  blob: Blob;
  contentHash: string;
  suggestedType?: DocType;
  confirmedType?: DocType;
  uploadedAt: number;
}

export type RequirementCategory = "required_document" | "page_limit" | "word_limit" | "eligibility" | "deadline" | "formatting" | "other";

export interface Requirement {
  id: string;
  category: RequirementCategory;
  title: string;
  docType?: DocType;
  count?: number;
  min?: number;
  max?: number;
  unit?: "pages" | "words";
  eligibility?: {
    field: "gpa" | "degree" | "nationality" | "other";
    minGpa?: number;
    scale?: number;
    allowedValues?: string[];
    clear: boolean;
  };
  deadline?: { date?: string; time?: string; timezone?: string };
  quote: string;
  page: number;
  quoteVerified: boolean;
}

export interface Extraction {
  guidelineHash: string;
  pages: string[];
  requirements: Requirement[];
  model: string;
  version?: number;
  createdAt: number;
}

export type FindingStatus = "passed" | "action_needed" | "needs_verification";

export interface Finding {
  requirementId: string;
  status: FindingStatus;
  title: string;
  explanation: string;
  quote: string;
  page: number;
  evidence?: string;
  measured?: number;
  unit?: string;
  correction?: string;
}

export interface CheckResult {
  ranAt: number;
  inputHash: string;
  guidelineHash: string;
  guidelinePasted?: boolean;
  // When the requirements were read; a re-read of the same guideline can renumber them.
  extractedAt: number;
  findings: Finding[];
  status: FindingStatus;
  outstanding: number;
}

export interface StoredResults {
  applicationId: string;
  current?: CheckResult;
  previous?: CheckResult;
  lastError?: string;
}
