import { extractText, getDocumentProxy } from "unpdf";
import type { ParsedPdf } from "./types";

export const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

export async function parsePdf(bytes: Uint8Array): Promise<ParsedPdf> {
  const pdf = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: false });
  const chars = text.reduce((n, p) => n + p.trim().length, 0);
  return {
    pages: text,
    pageCount: totalPages,
    wordCount: text.reduce((n, p) => n + countWords(p), 0),
    // Scanned/image PDFs have almost no text layer: under ~20 chars per page on average.
    readable: totalPages > 0 && chars / totalPages >= 20,
  };
}
