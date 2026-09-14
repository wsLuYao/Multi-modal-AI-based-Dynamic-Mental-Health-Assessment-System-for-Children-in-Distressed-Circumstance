# Model Card — Keyword Baseline v1

> Despite the file name, this release does not ship a trained machine-learning model. It uses deterministic keyword rules.

## Intended use

- Reproducible software demonstrations with **fully synthetic or properly de-identified** Chinese narrative text.
- Teaching explainability, data minimization, and human-review workflows.
- A transparent baseline against which future research prototypes may be compared.

## Out of scope

- Psychological or psychiatric diagnosis.
- Automated screening, triage, eligibility, discipline, surveillance, or resource allocation.
- Unsupervised use with children or other vulnerable people.
- Any decision made without a suitably qualified professional reviewing the original context.

## Inputs and outputs

Input is Chinese text extracted from a DOCX document of at most 5 MiB and 100,000 extracted characters. The implementation checks five small, manually defined keyword groups:

1. guardianship-support gaps;
2. family-function pressure;
3. economic/living pressure;
4. neglect or harm signals;
5. behavioral-adaptation difficulties.

Output category values are **keyword coverage scores**, not probabilities. The `risk_indicator` is a bounded heuristic composed of category hits, selected emotion terms, first-person occurrences, text length, and explicit urgent-review terms. It has no validated clinical threshold.

## Data

No training corpus is used and no real-person dataset is included. Tests and examples are synthetic. The five-example random-forest artifact from the early prototype is deliberately excluded: such a sample cannot support meaningful generalization, and serialized pickle/joblib artifacts create an avoidable loading risk.

## Known limitations

- Exact substring matching is sensitive to wording, negation, quotation, sarcasm, and context.
- The lexicon is small, culturally narrow, and Chinese-only.
- Longer text can slightly change the heuristic indicator even when meaning is unchanged.
- A detected term may describe someone else, a past event, fiction, or a denial.
- Absence of a term does not mean absence of need or risk.
- The priority label is a workflow prompt, not an emergency assessment.

## Human oversight

Users must inspect the source context, apply their institution's safeguarding procedure, document overrides, and provide an appropriate route to qualified help. An urgent-review match should stop automated interpretation and trigger the established human protocol.

## Versioning

The implementation reports `keyword-baseline-v1`. Any change to terms, weights, thresholds, or output meaning requires a new algorithm version and corresponding test updates.
