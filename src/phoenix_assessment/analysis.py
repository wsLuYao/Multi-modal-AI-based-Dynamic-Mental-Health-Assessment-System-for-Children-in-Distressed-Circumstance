"""Deterministic, explainable text-signal baseline.

This module intentionally avoids diagnostic language. Its outputs are indicators for
software demonstrations and human review, not clinical findings.
"""

from __future__ import annotations

import math
import re
import unicodedata
from collections.abc import Iterable
from dataclasses import asdict, dataclass

ALGORITHM_VERSION = "keyword-baseline-v1"

CATEGORY_TERMS: dict[str, tuple[str, ...]] = {
    "监护支持不足": ("无人照顾", "无人监护", "缺乏监护", "长期独处", "监护缺失"),
    "家庭功能压力": ("家庭冲突", "争吵", "亲子关系", "家庭矛盾", "照顾者冲突"),
    "经济生活压力": ("经济困难", "收入低", "生活困难", "欠费", "物资不足"),
    "忽视或伤害线索": ("缺乏关爱", "遭受忽视", "被打", "被辱骂", "被欺负"),
    "行为适应困难": ("逃课", "打架", "离家", "行为偏离", "纪律冲突"),
}

EMOTION_TERMS = ("伤心", "害怕", "紧张", "孤独", "难过", "无助", "焦虑", "绝望")
URGENT_REVIEW_TERMS = ("自杀", "轻生", "不想活", "自残", "伤害自己")
FIRST_PERSON_TERMS = ("我", "我们")


@dataclass(frozen=True)
class AnalysisResult:
    algorithm: str
    primary_category: str
    category_scores: dict[str, float]
    risk_indicator: float
    review_priority: str
    matched_signals: dict[str, list[str]]
    urgent_review_required: bool
    text_length: int
    disclaimer: str

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


def normalize_text(text: str) -> str:
    """Normalize Unicode and whitespace without retaining a second raw copy."""

    if not isinstance(text, str):
        raise TypeError("text must be a string")
    normalized = unicodedata.normalize("NFKC", text)
    return re.sub(r"\s+", " ", normalized).strip()


def _matched_terms(text: str, terms: Iterable[str]) -> list[str]:
    return [term for term in terms if term in text]


def _bounded_ratio(value: float) -> float:
    return round(max(0.0, min(1.0, value)), 4)


def analyze_text(text: str) -> dict[str, object]:
    """Return transparent heuristic indicators for Chinese narrative text.

    The five category scores are normalized keyword coverage values. They are not
    probabilities and must not be interpreted as prevalence, diagnosis, or model
    confidence.
    """

    cleaned = normalize_text(text)
    if not cleaned:
        raise ValueError("document contains no analyzable text")

    category_matches = {
        category: _matched_terms(cleaned, terms) for category, terms in CATEGORY_TERMS.items()
    }
    category_scores = {
        category: _bounded_ratio(len(matches) / max(1, len(CATEGORY_TERMS[category])))
        for category, matches in category_matches.items()
    }
    max_score = max(category_scores.values(), default=0.0)
    primary_category = (
        max(category_scores, key=category_scores.get) if max_score > 0 else "信息不足，需人工复核"
    )

    emotion_matches = _matched_terms(cleaned, EMOTION_TERMS)
    urgent_matches = _matched_terms(cleaned, URGENT_REVIEW_TERMS)
    first_person_hits = sum(cleaned.count(term) for term in FIRST_PERSON_TERMS)
    text_scale = 1 - math.exp(-len(cleaned) / 1200)
    signal_density = sum(len(matches) for matches in category_matches.values()) / 10

    risk_indicator = _bounded_ratio(
        0.28 * min(1.0, len(emotion_matches) / 3)
        + 0.24 * min(1.0, signal_density)
        + 0.08 * min(1.0, first_person_hits / 6)
        + 0.05 * text_scale
        + (0.5 if urgent_matches else 0.0)
    )
    if urgent_matches or risk_indicator >= 0.65:
        review_priority = "优先人工复核"
    elif risk_indicator >= 0.3:
        review_priority = "常规人工复核"
    else:
        review_priority = "信息有限"

    matched_signals = {
        category: matches for category, matches in category_matches.items() if matches
    }
    if emotion_matches:
        matched_signals["情绪词"] = emotion_matches
    if urgent_matches:
        matched_signals["优先复核词"] = urgent_matches

    return AnalysisResult(
        algorithm=ALGORITHM_VERSION,
        primary_category=primary_category,
        category_scores=category_scores,
        risk_indicator=risk_indicator,
        review_priority=review_priority,
        matched_signals=matched_signals,
        urgent_review_required=bool(urgent_matches),
        text_length=len(cleaned),
        disclaimer="研究演示指标，不构成诊断、筛查结论或干预建议。",
    ).to_dict()
