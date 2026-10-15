// SHA-256 fingerprints via Web Crypto (available in browsers on localhost and in Node).
export async function sha256(data: BufferSource | string): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Page boundaries are part of the fingerprint: same words, different page breaks → different hash.
export const guidelineHash = (pages: string[]) => sha256(pages.map((p, i) => `[[PAGE ${i + 1}]]\n${p}`).join("\n"));
