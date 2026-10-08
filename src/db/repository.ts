import Dexie, { type EntityTable } from "dexie";
import type { Session } from "../features/missions/engine";
export type Suggestion = { label: string; similarity: number };
export type Observation = {
  id: string;
  title: string;
  notes: string;
  date: string;
  category: string;
  location?: string;
  missionId?: string;
  suggestions?: Suggestion[];
  photo?: Blob;
};
export const db = new Dexie("trailmate-v1") as Dexie & {
  observations: EntityTable<Observation, "id">;
  sessions: EntityTable<Session, "id">;
};
db.version(1).stores({
  observations: "id,date,category,missionId",
  sessions: "id,missionId,status,completedAt",
});
export async function compressPhoto(file: Blob): Promise<Blob> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 20 * 1024 * 1024
  )
    throw Error("Choose a JPEG, PNG or WebP under 20 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(Error("Photo compression failed."))),
        "image/jpeg",
        0.82,
      ),
    );
  } finally {
    bitmap.close();
  }
}
const blobData = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
export async function exportJournal() {
  const rows = await db.observations.toArray();
  return JSON.stringify(
    {
      version: 1,
      observations: await Promise.all(
        rows.map(async (r) => ({
          ...r,
          photo: r.photo ? await blobData(r.photo) : undefined,
        })),
      ),
    },
    null,
    2,
  );
}
export function validateImport(
  input: unknown,
): Array<Omit<Observation, "photo"> & { photo?: string }> {
  if (
    !input ||
    typeof input !== "object" ||
    !("version" in input) ||
    input.version !== 1 ||
    !("observations" in input) ||
    !Array.isArray(input.observations) ||
    input.observations.length > 1000
  )
    throw Error("Invalid journal format (version 1, maximum 1,000 entries).");
  const ids = new Set<string>();
  return input.observations.map((r: Record<string, unknown>) => {
    if (!r || typeof r !== "object") throw Error("Invalid observation.");
    for (const [field, max] of [
      ["id", 100],
      ["title", 200],
      ["notes", 10000],
      ["date", 40],
      ["category", 100],
    ] as const)
      if (typeof r[field] !== "string" || (r[field] as string).length > max)
        throw Error(`Invalid ${field}.`);
    if (
      !r.id ||
      !r.title ||
      ids.has(r.id as string) ||
      !Number.isFinite(Date.parse(r.date as string))
    )
      throw Error("Invalid ID, title or date.");
    ids.add(r.id as string);
    for (const field of ["location", "missionId"])
      if (
        r[field] !== undefined &&
        (typeof r[field] !== "string" || (r[field] as string).length > 200)
      )
        throw Error(`Invalid ${field}.`);
    if (
      r.photo !== undefined &&
      (typeof r.photo !== "string" ||
        r.photo.length > 4_000_000 ||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(r.photo))
    )
      throw Error("Invalid photo.");
    if (
      r.suggestions !== undefined &&
      (!Array.isArray(r.suggestions) ||
        r.suggestions.length > 20 ||
        r.suggestions.some(
          (s) =>
            !s ||
            typeof s.label !== "string" ||
            s.label.length > 100 ||
            typeof s.similarity !== "number" ||
            !Number.isFinite(s.similarity) ||
            Math.abs(s.similarity) > 1.001,
        ))
    )
      throw Error("Invalid suggestions.");
    return {
      id: r.id as string,
      title: r.title as string,
      notes: r.notes as string,
      date: r.date as string,
      category: r.category as string,
      location: r.location as string | undefined,
      missionId: r.missionId as string | undefined,
      suggestions: r.suggestions as Suggestion[] | undefined,
      photo: r.photo as string | undefined,
    };
  });
}
export async function importJournal(text: string) {
  if (text.length > 30_000_000) throw Error("Import must be under 30 MB.");
  const rows = validateImport(JSON.parse(text));
  const converted = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      photo: r.photo ? await (await fetch(r.photo)).blob() : undefined,
    })),
  );
  await db.transaction("rw", db.observations, async () => {
    for (const row of converted) {
      const existing = await db.observations.get(row.id);
      if (existing)
        throw Error(
          "Import contains existing IDs. Delete duplicates or use a fresh journal.",
        );
    }
    await db.observations.bulkAdd(converted);
  });
}
