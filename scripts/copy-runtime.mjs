import { mkdirSync, copyFileSync, readdirSync, rmSync } from "node:fs";
rmSync("public/ort", { recursive: true, force: true });
mkdirSync("public/ort", { recursive: true });
for (const f of readdirSync("node_modules/onnxruntime-web/dist"))
  if (/^ort-wasm-simd-threaded\.asyncify\.(wasm|mjs)$/.test(f))
    copyFileSync(`node_modules/onnxruntime-web/dist/${f}`, `public/ort/${f}`);
