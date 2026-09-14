# Contributing / 参与贡献

Thank you for helping improve this research prototype. 中文说明见下半部分。

## Workflow

1. Open an issue describing the user need and safety impact.
2. Fork the repository and create a focused branch.
3. Use synthetic data only. Never attach a real case file, report, identifier, or credential.
4. Install development dependencies with `python -m pip install -e ".[dev]"`.
5. Run `ruff check .` and `pytest` before opening a pull request.
6. Explain behavior changes, tests, privacy impact, and known limitations in the pull request.

Changes to keywords, weights, thresholds, or output semantics must update the algorithm version, model card, and tests. Features that introduce real-person data processing require a threat model and data-governance review.

## 中文

请先用 Issue 说明用户需求与潜在安全影响，再提交单一目标的改动。开发、测试和截图只能使用合成数据，禁止上传真实个案、报告、标识符或凭据。提交前运行代码检查与测试，并在 PR 中写明行为变化、验证结果、隐私影响和剩余限制。

任何关键词、权重、阈值或输出含义的变化，都必须同步更新算法版本、模型卡和测试；新增真实个人数据处理能力时，必须同时提交威胁模型和数据治理评审材料。
