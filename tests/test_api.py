import base64

import pytest

from phoenix_assessment.api import AssessmentAPI


def test_end_to_end_analysis_does_not_store_raw_document(tmp_path, docx_bytes: bytes) -> None:
    api = AssessmentAPI(tmp_path)
    result = api.analyze_case(
        {"alias": "DEMO-001", "age_group": "12–14 岁", "method": "合成叙事样例"},
        base64.b64encode(docx_bytes).decode("ascii"),
    )
    assert result["meta"]["alias"] == "DEMO-001"
    assert "raw_text" not in result["analysis"]
    assert result["report_uri"] is None
    assert not list(tmp_path.glob("*.docx"))
    assert list(tmp_path.iterdir()) == []
    assert api.load_history()["persistent"] is False
    assert api.load_history()["reports_enabled"] is False


def test_report_output_requires_explicit_opt_in(tmp_path, docx_bytes: bytes) -> None:
    api = AssessmentAPI(tmp_path, write_reports=True)
    result = api.analyze_case(
        {"alias": "DEMO-REPORT", "age_group": "未填写", "method": "合成叙事样例"},
        base64.b64encode(docx_bytes).decode("ascii"),
    )
    assert str(result["report_uri"]).startswith("file:")
    assert len(list((tmp_path / "reports").glob("*.html"))) == 1
    assert api.load_history()["reports_enabled"] is True


def test_metadata_length_is_limited(tmp_path, docx_bytes: bytes) -> None:
    api = AssessmentAPI(tmp_path)
    with pytest.raises(ValueError, match="alias"):
        api.analyze_case(
            {"alias": "x" * 41},
            base64.b64encode(docx_bytes).decode("ascii"),
        )


@pytest.mark.parametrize(
    ("meta", "message"),
    [
        ({"alias": "张三"}, "alias"),
        ({"age_group": "13 岁"}, "age_group"),
        ({"method": "学校访谈"}, "method"),
    ],
)
def test_metadata_is_minimized_to_documented_values(
    tmp_path, docx_bytes: bytes, meta: dict[str, str], message: str
) -> None:
    api = AssessmentAPI(tmp_path)
    with pytest.raises(ValueError, match=message):
        api.analyze_case(meta, base64.b64encode(docx_bytes).decode("ascii"))


def test_clear_history(tmp_path, docx_bytes: bytes) -> None:
    api = AssessmentAPI(tmp_path)
    api.analyze_case({}, base64.b64encode(docx_bytes).decode("ascii"))
    api.clear_history()
    assert api.load_history()["items"] == []
