export type DocType = "cv" | "motivation_letter" | "transcript" | "recommendation_letter" | "other";

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  cv: "CV",
  motivation_letter: "Motivation letter",
  transcript: "Transcript",
  recommendation_letter: "Recommendation letter",
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
  quote: string;
  page: number;
  quoteVerified: boolean;
}

export interface Extraction {
  guidelineHash: string;
  pages: string[];
  requirements: Requirement[];
  model: string;
  createdAt: number;
}
