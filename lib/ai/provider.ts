import type { Requirement } from "../types";
import { gemini } from "./gemini";

// What the AI returns before code assigns IDs and verifies quotes.
export type RawRequirement = Omit<Requirement, "id" | "quoteVerified">;

export interface AiProvider {
  model: string;
  extractRequirements(pages: string[]): Promise<RawRequirement[]>;
}

export class AiUnavailableError extends Error {}
export class AiBadOutputError extends Error {}

// Swapping providers: add a file next to gemini.ts and change this line.
export const getProvider = (): AiProvider => gemini();
