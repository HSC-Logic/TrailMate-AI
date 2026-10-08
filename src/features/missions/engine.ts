export type Mission = {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: "Easy" | "Gentle challenge";
  category: string;
  steps: string[];
  safety: string;
};
const titles = [
  "Find three different leaf shapes",
  "Observe five birds",
  "Photograph an interesting tree",
  "Identify three natural textures",
  "Listen to outdoor sounds",
  "Find flowers of three colors",
  "Observe insects safely",
  "Discover a shaded walking route",
  "Find five shades of green",
  "Watch cloud movement",
  "Find signs of seasonal change",
  "Observe natural patterns",
  "Discover an unusual seed shape",
  "Listen for different bird calls",
  "Find evidence of pollination",
  "Explore a public garden",
  "Record a sunrise or sunset",
  "Observe a butterfly",
  "Notice three bark textures",
  "Take a screen-free nature walk",
];
const categories = [
  "Plants",
  "Wildlife",
  "Plants",
  "Mindfulness",
  "Mindfulness",
  "Plants",
  "Wildlife",
  "Walking",
  "Plants",
  "Mindfulness",
  "Plants",
  "Mindfulness",
  "Plants",
  "Wildlife",
  "Wildlife",
  "Walking",
  "Mindfulness",
  "Wildlife",
  "Plants",
  "Walking",
];
export const missions: Mission[] = titles.map((title, i) => ({
  id: `mission-${i + 1}`,
  title,
  description: [
    "Slow down. A small discovery is waiting just outside.",
    "Explore a familiar place with fresh eyes.",
    "Leave everything as you found it. Bring back a memory.",
  ][i % 3],
  duration: i === 4 ? 10 : i === 9 ? 5 : i === 19 ? 20 : 10 + (i % 3) * 5,
  difficulty: i % 4 === 0 ? "Gentle challenge" : "Easy",
  category: categories[i],
  steps: [
    "Choose a safe, accessible public outdoor space.",
    `${title}. Observe quietly and keep a respectful distance.`,
    "Pause, notice one detail, and optionally save a journal entry.",
  ],
  safety:
    "Stay on public paths. Check weather, carry water, avoid midday heat. Never touch, eat, collect, or disturb unknown plants or wildlife.",
}));
export type Session = {
  id: string;
  missionId: string;
  startedAt: number;
  runningSince: number | null;
  elapsedMs: number;
  status: "active" | "paused" | "completed" | "cancelled";
  completedAt?: number;
};
export const elapsed = (s: Session, now = Date.now()) =>
  s.elapsedMs +
  (s.runningSince === null ? 0 : Math.max(0, now - s.runningSince));
export function transition(
  s: Session,
  action: "pause" | "resume" | "complete" | "cancel",
  now = Date.now(),
): Session {
  if (s.status === "completed" || s.status === "cancelled")
    throw Error("This session has ended.");
  if (action === "resume")
    return { ...s, status: "active", runningSince: s.runningSince ?? now };
  return {
    ...s,
    elapsedMs: elapsed(s, now),
    runningSince: null,
    status:
      action === "pause"
        ? "paused"
        : action === "complete"
          ? "completed"
          : "cancelled",
    ...(action === "complete" ? { completedAt: now } : {}),
  };
}
