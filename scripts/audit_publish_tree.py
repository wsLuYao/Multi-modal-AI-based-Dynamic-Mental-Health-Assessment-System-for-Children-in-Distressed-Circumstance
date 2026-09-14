#!/usr/bin/env python3
"""Fail when the publishable tree contains common sensitive artifacts or secrets."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", ".venv", "venv", ".pytest_cache", ".ruff_cache", "__pycache__"}
BLOCKED_DIRS = {"runtime", "reports"}
BLOCKED_SUFFIXES = {".docx", ".pdf", ".pkl", ".pickle", ".joblib", ".key", ".pem"}
BLOCKED_NAMES = {"history.json", ".env"}
TEXT_SUFFIXES = {
    "",
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".py",
    ".svg",
    ".toml",
    ".txt",
    ".yaml",
    ".yml",
}

SENSITIVE_PATTERNS = {
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "GitHub token": re.compile(r"\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,})\b"),
    "OpenAI-style token": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "private key": re.compile(r"-{5}BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-{5}"),
    "credential assignment": re.compile(
        r"(?i)\b(?:api[_-]?key|client[_-]?secret|password|passwd)\s*[:=]\s*"
        r"[\"']?[A-Za-z0-9_./+=-]{12,}"
    ),
    "email address": re.compile(r"(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b"),
    "mainland China mobile number": re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)"),
    "PRC identity number": re.compile(r"(?<!\d)\d{17}[0-9Xx](?!\d)"),
}


def _is_skipped(path: Path) -> bool:
    return any(part in SKIP_DIRS or part.endswith(".egg-info") for part in path.parts)


def _candidate_files() -> list[Path]:
    """Return tracked and publishable untracked files, excluding Git-ignored runtime data."""

    try:
        result = subprocess.run(
            ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
            cwd=ROOT,
            check=True,
            capture_output=True,
        )
    except (FileNotFoundError, subprocess.CalledProcessError):
        return [path for path in ROOT.rglob("*") if path.is_file()]
    return [ROOT / item for item in result.stdout.decode("utf-8").split("\0") if item]


def audit() -> list[str]:
    findings: list[str] = []
    for path in _candidate_files():
        relative = path.relative_to(ROOT)
        if _is_skipped(relative):
            continue

        folded_parts = {part.casefold() for part in relative.parts[:-1]}
        if folded_parts & BLOCKED_DIRS:
            findings.append(f"blocked runtime directory: {relative.as_posix()}")
        if path.suffix.casefold() in BLOCKED_SUFFIXES:
            findings.append(f"blocked artifact type: {relative.as_posix()}")
        if path.name.casefold() in BLOCKED_NAMES:
            findings.append(f"blocked local-data file: {relative.as_posix()}")

        if path.suffix.casefold() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            findings.append(f"non-UTF-8 text file: {relative.as_posix()}")
            continue
        for label, pattern in SENSITIVE_PATTERNS.items():
            if pattern.search(text):
                findings.append(f"possible {label}: {relative.as_posix()}")
    return findings


def main() -> int:
    findings = audit()
    if findings:
        print("Publish-tree audit failed:")
        for finding in sorted(set(findings)):
            print(f"- {finding}")
        return 1
    print("Publish-tree audit passed: no blocked artifacts or common sensitive patterns found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
