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
