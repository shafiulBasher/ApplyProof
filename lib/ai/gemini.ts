import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import { AiBadOutputError, AiUnavailableError, type AiProvider, type RawRequirement } from "./provider";

const DOC_TYPES = ["cv", "motivation_letter", "transcript", "recommendation_letter", "other"];

const SCHEMA = {
  type: "object",
  properties: {
    requirements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["required_document", "page_limit", "word_limit", "eligibility", "deadline", "formatting", "other"] },
          title: { type: "string" },
          docType: { type: "string", enum: DOC_TYPES },
          count: { type: "integer" },
          min: { type: "number" },
          max: { type: "number" },
          unit: { type: "string", enum: ["pages", "words"] },
          eligibility: {
            type: "object",
            properties: {
              field: { type: "string", enum: ["gpa", "degree", "nationality", "other"] },
              minGpa: { type: "number" },
              scale: { type: "number" },
              allowedValues: { type: "array", items: { type: "string" } },
              clear: { type: "boolean" },
            },
            required: ["field", "clear"],
          },
          deadline: {
            type: "object",
            properties: { date: { type: "string" }, time: { type: "string" }, timezone: { type: "string" } },
          },
          quote: { type: "string" },
          page: { type: "integer" },
        },
        required: ["category", "title", "quote", "page"],
      },
    },
  },
  required: ["requirements"],
};

const PROMPT = `You extract application requirements from an official guideline. The guideline's text is below, split into pages labeled [[PAGE n]].

List every requirement the applicant must meet. Rules:
- Only list requirements stated in the text. Never invent or infer one. Skip descriptions of the selection process.
- "quote" must be copied character for character from a single page: one contiguous passage, no ellipses, no paraphrasing. Use the shortest full sentence that states the rule. "page" is the n of that page's [[PAGE n]] label.
- One item per rule. A required document with a length limit gets two items: a "required_document" item and a "page_limit" or "word_limit" item for the same docType.
- required_document: set docType and count (e.g. "two letters" -> 2; otherwise 1).
- page_limit / word_limit: set docType, unit, and max and/or min. "between 500 and 800 words" -> min 500, max 800.
- eligibility: every rule about who may apply (degree held, GPA, nationality, work authorization, language skills) is its own eligibility item; never skip one. Set eligibility.field. "nationality" is only for rules about citizenship; work authorization, visa, residency, or language rules use field "other" with clear=false. GPA rules: minGpa and scale (e.g. "3.0 on a 4.0 scale" -> minGpa 3, scale 4). Degree or nationality rules: allowedValues listing the accepted values in plain words. Set clear=false when the rule can't be checked objectively from a stated value (e.g. "strong English proficiency"), otherwise clear=true.
- deadline: submission deadlines. Set deadline.date, deadline.time, and deadline.timezone each copied exactly as written in the quote (e.g. "October 20, 2027", "23:59", "CET"). Leave out any part the text doesn't state; never guess one. formatting: file format, font, or layout rules. other: anything else required.
- docType is one of: cv, motivation_letter, transcript, recommendation_letter, other.
- "title" is a short plain label, e.g. "CV length", "Recommendation letters", "Minimum GPA".`;

export function gemini(): AiProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  // A comma-separated list of free models, each tried at most once, in order, until one answers.
  const models = (process.env.GEMINI_MODEL ?? "").split(",").map((m) => m.trim()).filter(Boolean);
  if (!apiKey || models.length === 0) throw new AiUnavailableError("GEMINI_API_KEY and GEMINI_MODEL must be set in .env.local.");
  const ai = new GoogleGenAI({ apiKey });

  const provider: AiProvider = {
    model: models[0],
    async extractRequirements(pages) {
      const contents = `${PROMPT}\n\n${pages.map((p, i) => `[[PAGE ${i + 1}]]\n${p}`).join("\n\n")}`;
      let text: string | undefined;
      for (const [i, model] of models.entries()) {
        try {
          const res = await ai.models.generateContent({
            model,
            contents,
            // Low thinking: extraction is copy-and-label work. Every listed model accepts LOW and kept 10/10 accuracy.
            config: { temperature: 0, responseMimeType: "application/json", responseJsonSchema: SCHEMA, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
          });
          text = res.text;
          provider.model = model;
          break;
        } catch (e) {
          const status = e instanceof ApiError ? e.status : undefined;
          // A bad key (401/403) fails for every model, so stop; anything else (busy, quota, retired model) tries the next one.
          if (status !== 401 && status !== 403 && i < models.length - 1) continue;
          // Out of free models, or a bad key: stop. Never fall back to anything paid.
          throw new AiUnavailableError(`Gemini request failed${status ? ` (HTTP ${status})` : ""}: ${(e as Error).message}`);
        }
      }
      try {
        const parsed = JSON.parse(text ?? "");
        if (!Array.isArray(parsed.requirements)) throw new Error("no requirements array");
        return parsed.requirements as RawRequirement[];
      } catch {
        throw new AiBadOutputError("Gemini returned malformed JSON.");
      }
    },
  };
  return provider;
}
