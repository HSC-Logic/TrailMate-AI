export const candidates = [
  "Leaf",
  "Flower",
  "Tree",
  "Grass",
  "Fern",
  "Moss",
  "Seed or fruit",
  "Bird",
  "Butterfly",
  "Insect",
  "Mushroom",
  "Rock",
  "Water",
  "Cloud",
  "Tree bark",
];
export function cosine(a: ArrayLike<number>, b: ArrayLike<number>) {
  if (a.length !== b.length || !a.length)
    throw Error("Invalid embedding dimensions.");
  let dot = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  if (!aa || !bb) throw Error("Empty embedding.");
  return dot / Math.sqrt(aa * bb);
}
