"""pywebview bridge with input validation and private-by-default storage."""

from __future__ import annotations

import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from .analysis import analyze_text
from .document import decode_base64_document, extract_docx_text
from .reporting import build_report_html
from .storage import CaseStore

ALIAS_PATTERN = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,39}\Z")
AGE_GROUPS = {"未填写", "6–11 岁", "12–14 岁", "15–17 岁"}
METHODS = {"合成叙事样例", "人工去标识化材料", "其他演示材料"}


class AssessmentAPI:
    def __init__(
        self,
        runtime_dir: Path,
        persist_history: bool = False,
        write_reports: bool = False,
    ) -> None:
        self.runtime_dir = runtime_dir
        self.write_reports = write_reports
        history_path = runtime_dir / "history.json" if persist_history else None
        self.store = CaseStore(history_path)

    @staticmethod
    def _clean_meta(meta: object) -> dict[str, str]:
        if not isinstance(meta, dict):
            raise ValueError("metadata must be an object")
        alias = str(meta.get("alias", "DEMO-UNNAMED")).strip()
        age_group = str(meta.get("age_group", "未填写")).strip()
        method = str(meta.get("method", "合成叙事样例")).strip()
        if not ALIAS_PATTERN.fullmatch(alias):
            raise ValueError(
                "alias must be 1–40 ASCII letters, digits, dots, underscores, or hyphens"
            )
        if age_group not in AGE_GROUPS:
            raise ValueError("age_group is not an allowed coarse age band")
        if method not in METHODS:
            raise ValueError("method is not an allowed demonstration source")
        return {"alias": alias, "age_group": age_group, "method": method}

    def analyze_case(self, meta: object, file_data: str) -> dict[str, object]:
        cleaned_meta = self._clean_meta(meta)
        raw = decode_base64_document(file_data)
        text = extract_docx_text(raw)
        analysis = analyze_text(text)

        case_id = uuid.uuid4().hex[:10]
        # ``datetime.UTC`` was introduced in Python 3.11; ``timezone.utc`` keeps
        # the advertised Python 3.10 support without changing the timestamp.
        created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        record: dict[str, object] = {
            "case_id": case_id,
            "created_at": created_at,
            "meta": cleaned_meta,
            "analysis": analysis,
        }
        self.store.append(record)
        report_uri: str | None = None
        if self.write_reports:
            report_path = build_report_html(
                case_id, cleaned_meta, analysis, self.runtime_dir / "reports"
            )
            report_uri = report_path.resolve().as_uri()
        return {**record, "report_uri": report_uri}

    def load_history(self) -> dict[str, object]:
        return {
            "persistent": self.store.persistent,
            "reports_enabled": self.write_reports,
            "items": self.store.all(),
        }

    def clear_history(self) -> dict[str, bool]:
        self.store.clear()
        return {"ok": True}


def from_environment() -> AssessmentAPI:
    runtime_dir = Path(os.environ.get("PHOENIX_RUNTIME_DIR", "runtime")).resolve()
    persist = os.environ.get("PHOENIX_PERSIST_HISTORY", "").lower() in {"1", "true", "yes"}
    write_reports = os.environ.get("PHOENIX_WRITE_REPORTS", "").lower() in {
        "1",
        "true",
        "yes",
    }
    return AssessmentAPI(
        runtime_dir=runtime_dir,
        persist_history=persist,
        write_reports=write_reports,
    )
