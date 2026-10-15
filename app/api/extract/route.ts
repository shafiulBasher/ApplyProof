import { extractVerified } from "@/lib/extract";
import { AiBadOutputError } from "@/lib/ai/provider";

// Receives only the guideline's page texts. Applicant documents never reach this route.
export async function POST(request: Request) {
  const { pages } = await request.json();
  if (!Array.isArray(pages) || !pages.every((p) => typeof p === "string") || pages.length === 0) {
    return Response.json({ error: "Upload an official application guideline first." }, { status: 400 });
  }
  try {
    return Response.json({ ...(await extractVerified(pages)), pages });
  } catch (e) {
    console.error(e);
    if (e instanceof AiBadOutputError) {
      return Response.json({ error: "The guideline couldn't be analyzed. Try again." }, { status: 502 });
    }
    return Response.json(
      { error: "The AI check couldn't run (free quota reached or service unavailable). Your previous results are unchanged. Try again later." },
      { status: 503 },
    );
  }
}
