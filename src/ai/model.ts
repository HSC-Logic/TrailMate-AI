import { candidates, cosine } from "./candidateCatalog";
import type { Suggestion } from "../db/repository";
const MODEL = "Xenova/clip-vit-base-patch32";
export const REVISION = "d15189d7028b43f1d3e65039190477f6af591c2a";
const FILES = [
  "config.json",
  "preprocessor_config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "special_tokens_map.json",
  "onnx/text_model_quantized.onnx",
  "onnx/vision_model_quantized.onnx",
];
const CACHE = "trailmate-model-v1";
let loaded: Promise<any> | undefined;
export async function modelCached() {
  const cache = await caches.open(CACHE);
  return (
    await Promise.all(
      FILES.map((f) =>
        cache.match(`https://huggingface.co/${MODEL}/resolve/${REVISION}/${f}`),
      ),
    )
  ).every(Boolean);
}
export async function clearModel() {
  const previous = loaded;
  loaded = undefined;
  if (previous) {
    try {
      const model = await previous;
      await Promise.all([model.text.dispose(), model.vision.dispose()]);
    } catch {
      /* Failed loads have no live session to dispose. */
    }
  }
  await caches.delete(CACHE);
}
export async function prepareModel(progress: (message: string) => void) {
  const cache = await caches.open(CACHE);
  for (let i = 0; i < FILES.length; i++) {
    const url = `https://huggingface.co/${MODEL}/resolve/${REVISION}/${FILES[i]}`;
    progress(`Downloading ${i + 1}/${FILES.length}: ${FILES[i]}`);
    if (!(await cache.match(url))) {
      const response = await fetch(url);
      if (!response.ok)
        throw Error(
          `Model download failed: ${response.status}. Retry while online.`,
        );
      await cache.put(url, response);
    }
  }
  await load(progress);
  progress(
    "AI ready. Cached artifacts verified; test airplane mode before a trip.",
  );
}
async function load(progress: (message: string) => void = () => {}) {
  if (!loaded)
    loaded = (async () => {
      if (!(await modelCached()))
        throw Error("Download AI for Offline Use first.");
      progress("Loading local AI. This may take a minute.");
      const t = await import("@huggingface/transformers");
      t.env.allowLocalModels = false;
      t.env.useBrowserCache = false;
      t.env.useCustomCache = true;
      t.env.customCache = await caches.open(CACHE);
      t.env.backends.onnx.wasm!.wasmPaths = {
        mjs: `${location.origin}${import.meta.env.BASE_URL}ort/ort-wasm-simd-threaded.asyncify.mjs`,
        wasm: `${location.origin}${import.meta.env.BASE_URL}ort/ort-wasm-simd-threaded.asyncify.wasm`,
      };
      t.env.backends.onnx.wasm!.numThreads = 1;
      // ponytail: WASM CPU only; add WebGPU after verified device benchmarks.
      const opts = {
        revision: REVISION,
        dtype: "q8" as const,
        device: "wasm" as const,
      };
      const [tokenizer, processor, text, vision] = await Promise.all([
        // Construct from pinned cache: Transformers.js 4.3.1 registry probes main despite revision.
        Promise.all(
          ["tokenizer.json", "tokenizer_config.json"].map(async (f) =>
            (await (
              await caches.open(CACHE)
            ).match(
              `https://huggingface.co/${MODEL}/resolve/${REVISION}/${f}`,
            ))!.json(),
          ),
        ).then(([json, config]) => new t.CLIPTokenizer(json, config)),
        t.AutoProcessor.from_pretrained(MODEL, opts),
        t.CLIPTextModelWithProjection.from_pretrained(MODEL, opts),
        t.CLIPVisionModelWithProjection.from_pretrained(MODEL, opts),
      ]);
      const tokens = await tokenizer(
        candidates.map((c) => `a photograph of ${c.toLowerCase()} in nature`),
        { padding: true, truncation: true },
      );
      const output = await text(tokens);
      const vectors = output.text_embeds.tolist() as number[][];
      return { t, processor, text, vision, vectors };
    })().catch((e) => {
      loaded = undefined;
      throw e;
    });
  return loaded;
}
export async function identify(photo: Blob): Promise<Suggestion[]> {
  const { t, processor, vision, vectors } = await load();
  const url = URL.createObjectURL(photo);
  let image;
  try {
    image = await t.RawImage.read(url);
    const inputs = await processor(image);
    const output = await vision(inputs);
    const embedding = output.image_embeds.data;
    return candidates
      .map((label, i) => ({ label, similarity: cosine(embedding, vectors[i]) }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  } finally {
    URL.revokeObjectURL(url);
  }
}
