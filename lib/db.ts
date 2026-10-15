import Dexie, { type EntityTable } from "dexie";
import type { Application, Extraction, StoredDocument } from "./types";

export const db = new Dexie("applyproof") as Dexie & {
  applications: EntityTable<Application, "id">;
  documents: EntityTable<StoredDocument, "id">;
  extractions: EntityTable<Extraction, "guidelineHash">;
};

db.version(1).stores({
  applications: "id, createdAt",
  documents: "id, applicationId",
});
db.version(2).stores({
  extractions: "guidelineHash",
});

// Runs a save and turns a storage failure (e.g. quota exceeded) into a message naming the item.
export async function save<T>(what: string, op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (e) {
    throw new Error(`Couldn't save ${what} in this browser, so it won't be kept. (${(e as Error).name})`);
  }
}
