import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  missions,
  elapsed,
  transition,
  type Session,
} from "../src/features/missions/engine";
import {
  db,
  exportJournal,
  importJournal,
  validateImport,
} from "../src/db/repository";
import { cosine } from "../src/ai/candidateCatalog";
const session: Session = {
  id: "one",
  missionId: "mission-1",
  startedAt: 1000,
  runningSince: 1000,
  elapsedMs: 0,
  status: "active",
};
beforeEach(async () => {
  await db.observations.clear();
  await db.sessions.clear();
});
describe("mission engine", () => {
  it("has twenty complete curated activities", () => {
    expect(missions).toHaveLength(20);
    expect(new Set(missions.map((m) => m.id)).size).toBe(20);
    for (const m of missions) {
      expect(m.steps.length).toBeGreaterThan(1);
      expect(m.safety).toContain("Never touch");
    }
  });
  it("survives sleep, pause, reload and resume without counting paused time", () => {
    const paused = transition(session, "pause", 61000);
    expect(elapsed(paused, 121000)).toBe(60000);
    const restored = JSON.parse(JSON.stringify(paused));
    const resumed = transition(restored, "resume", 121000);
    expect(elapsed(resumed, 181000)).toBe(120000);
    expect(transition(resumed, "complete", 181000).elapsedMs).toBe(120000);
  });
  it("does not restart terminal sessions", () =>
    expect(() =>
      transition(transition(session, "cancel", 2000), "resume"),
    ).toThrow());
  it("persists sessions", async () => {
    await db.sessions.add(session);
    expect(await db.sessions.get("one")).toEqual(session);
  });
});
describe("local journal integration", () => {
  it("creates, edits, exports and imports", async () => {
    const row = {
      id: "r",
      title: "Leaf",
      notes: "Green",
      date: "2026-10-08T12:00:00Z",
      category: "Leaf",
    };
    await db.observations.add(row);
    await db.observations.update("r", { notes: "Veined" });
    const exported = await exportJournal();
    await db.observations.clear();
    await importJournal(exported);
    expect((await db.observations.get("r"))?.notes).toBe("Veined");
  });
  it("rejects duplicates atomically", async () => {
    const row = {
      id: "r",
      title: "Leaf",
      notes: "",
      date: "2026-10-08",
      category: "Leaf",
    };
    await db.observations.add(row);
    await expect(
      importJournal(
        JSON.stringify({
          version: 1,
          observations: [{ ...row, id: "new" }, row],
        }),
      ),
    ).rejects.toThrow("existing");
    expect(await db.observations.count()).toBe(1);
  });
  it.each([
    { version: 2, observations: [] },
    { version: 1, observations: [{ id: 1 }] },
    {
      version: 1,
      observations: [
        { id: "r", title: "bad", notes: "", date: "invalid", category: "Leaf" },
      ],
    },
  ])("rejects invalid imports", (input) =>
    expect(() => validateImport(input)).toThrow(),
  );
});
describe("AI adapter safeguards (no real inference in unit tests)", () => {
  it("ranks using cosine, not probabilities", () => {
    expect(cosine([1, 0], [1, 0])).toBe(1);
    expect(cosine([1, 0], [-1, 0])).toBe(-1);
    expect(cosine([1, 0], [0, 1])).toBe(0);
    expect(() => cosine([0, 0], [1, 0])).toThrow();
  });
  it("requires every artifact; refuses partial cache", async () => {
    const match = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("caches", { open: async () => ({ match }) });
    const { modelCached, identify } = await import("../src/ai/model");
    expect(await modelCached()).toBe(false);
    await expect(identify(new Blob())).rejects.toThrow("Download AI");
    expect(match).toHaveBeenCalledTimes(14);
    vi.unstubAllGlobals();
  });
});
