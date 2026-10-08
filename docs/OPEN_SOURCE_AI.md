# Open-source AI provenance
Verified public sources on 2026-10-08:
- Original implementation and MIT license: https://github.com/openai/CLIP/blob/main/LICENSE
- Original project distributes model-download code and tokenizer under its MIT LICENSE: https://github.com/openai/CLIP
- Tokenizer is part of that original MIT project: https://github.com/openai/CLIP/blob/main/clip/simple_tokenizer.py
- Original model card: https://huggingface.co/openai/clip-vit-base-patch32
- Browser ONNX conversion and Transformers.js usage: https://huggingface.co/Xenova/clip-vit-base-patch32
- Artifact metadata: https://huggingface.co/api/models/Xenova/clip-vit-base-patch32/tree/main/onnx
- Transformers.js Apache-2.0: https://github.com/huggingface/transformers.js/blob/main/LICENSE
- ONNX Runtime MIT: https://github.com/microsoft/onnxruntime/blob/main/LICENSE

## Exact artifacts
Model: `Xenova/clip-vit-base-patch32`; immutable revision `d15189d7028b43f1d3e65039190477f6af591c2a`.
`onnx/text_model_quantized.onnx`: 64,504,507 bytes.
`onnx/vision_model_quantized.onnx`: 89,117,001 bytes.
Also cache config.json, preprocessor_config.json, tokenizer.json, tokenizer_config.json, special_tokens_map.json. Runtime and tokenizer are cached separately from weights. No model binaries committed.

The conversion repository's card points to upstream but does **not** declare a separate license field. MIT provenance is the original project license covering its distributed software/model release; the conversion supplies no additional licensing grant or explicit weight-license field. This is a provenance limitation, not a separately verified converter license. Preserve upstream attribution and revisit this provenance if changing model/converter.

## Inference
Two independent projection models, q8 weights, WASM CPU, single-threaded; pinned Transformers.js 4.3.1. Fifteen `a photograph of … in nature` prompts. Compute text vectors once per loaded adapter. Image resized by CLIP processor; return top-three cosine similarities. No pipeline softmax or probability display. Label set heavily influences rankings; every image gets candidates even when none are appropriate. “Unknown / Not sure” is a user choice, not an invented calibrated threshold.

WASM supports CPU execution without WebGPU. This implementation deliberately selects WASM; it does not claim GPU acceleration. Desktop Chromium production verification is separate from theoretical runtime support. Safari/Firefox and low-memory phones need actual tests. Runtime uses asyncify WASM; older Safari compatibility is not established. Do not claim universal browser support.

## Limits
Not trained/validated for scientific species identification, edibility, toxicity, wildlife safety, or Sri Lankan biodiversity. Synthetic fixture tests execution, not recognition quality. No measured mobile memory budget, throughput, field accuracy, or outdoor observations yet. Photos never leave the browser; only public model artifacts are requested. Runtime dependency versions are locked. Cached model storage can be evicted.
