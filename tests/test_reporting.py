import pytest

from phoenix_assessment.reporting import build_report_html


def test_report_escapes_metadata(tmp_path) -> None:
    analysis = {
        "primary_category": "信息不足",
        "review_priority": "信息有限",
        "risk_indicator": 0.1,
        "category_scores": {"监护支持不足": 0.0},
    }
    path = build_report_html("case1", {"alias": "<script>alert(1)</script>"}, analysis, tmp_path)
    html = path.read_text("utf-8")
    assert "<script>alert(1)</script>" not in html
    assert "&lt;script&gt;" in html
    assert "临床诊断" in html
    assert "Content-Security-Policy" in html
    assert not list(tmp_path.glob("*.tmp"))


def test_report_rejects_case_id_path_traversal(tmp_path) -> None:
    analysis = {
        "primary_category": "信息不足",
        "review_priority": "信息有限",
        "risk_indicator": 0.1,
        "category_scores": {},
    }
    with pytest.raises(ValueError, match="case_id"):
        build_report_html("../outside", {}, analysis, tmp_path)
