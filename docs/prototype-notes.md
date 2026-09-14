# Prototype Notes / 原型整理说明

This repository consolidates two previously disconnected technical prototypes.

| Earlier prototype | What was retained | What changed |
| --- | --- | --- |
| Python + pywebview text application | DOCX input, five illustrative categories, local desktop flow, HTML result | Paths are portable; upload stays in memory; metadata is minimized; HTML is escaped; history is ephemeral by default; hard-coded PDF conversion was removed; unsafe serialized model files were replaced with transparent rules and tests |
| Static dashboard/chat mockup | Visual hierarchy, dashboard concept, upload/review interaction concept | Duplicate files, hard-coded credentials, fake authentication, names, unsupported accuracy claims, and fabricated operational totals were removed; the replacement is labeled synthetic and uses no CDN |

The original five-row random-forest training script and its `.pkl` outputs are not published as a model. One sample per class cannot establish generalization or accuracy, and untrusted pickle-compatible files can execute code when loaded. The deterministic baseline preserves the demonstrable software pipeline without suggesting validation that has not occurred.

Patent application documents, reports, temporary DOCX files, prior history, and real-case source material are intentionally absent from the current tree.
