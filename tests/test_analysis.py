import pytest

from phoenix_assessment.analysis import analyze_text, normalize_text


def test_normalize_text_normalizes_width_and_whitespace() -> None:
    assert normalize_text("  Ａ\n  B  ") == "A B"


def test_empty_text_is_rejected() -> None:
    with pytest.raises(ValueError, match="no analyzable text"):
        analyze_text(" \n ")


def test_category_matches_are_explainable() -> None:
    result = analyze_text("放学后长期独处，也缺乏监护，孩子觉得孤独。")
    assert result["primary_category"] == "监护支持不足"
    assert result["category_scores"]["监护支持不足"] == 0.4
    assert "长期独处" in result["matched_signals"]["监护支持不足"]


def test_no_keyword_does_not_force_a_category() -> None:
    result = analyze_text("这是一段不包含预设线索的完全合成说明。")
    assert result["primary_category"] == "信息不足，需人工复核"
    assert result["review_priority"] == "信息有限"


def test_urgent_term_requires_priority_review() -> None:
    result = analyze_text("合成文本中出现不想活这一测试词。")
    assert result["urgent_review_required"] is True
    assert result["review_priority"] == "优先人工复核"
    assert result["risk_indicator"] >= 0.5


def test_scores_are_indicators_not_probability_distribution() -> None:
    result = analyze_text("无人照顾，缺乏监护，也发生过家庭冲突。")
    assert sum(result["category_scores"].values()) != pytest.approx(1.0)
    assert result["algorithm"] == "keyword-baseline-v1"
