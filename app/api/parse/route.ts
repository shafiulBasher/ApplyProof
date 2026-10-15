import { parsePdf } from "@/lib/pdf";

// Reads one PDF locally: page texts and counts. No AI call.
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file uploaded." }, { status: 400 });
  try {
    return Response.json(await parsePdf(new Uint8Array(await file.arrayBuffer())));
  } catch {
    return Response.json({ error: "This file couldn't be opened as a PDF." }, { status: 422 });
  }
}
