"""Minimal case-history storage with privacy-preserving defaults."""

from __future__ import annotations

import json
import os
import threading
from copy import deepcopy
from pathlib import Path
from tempfile import NamedTemporaryFile

MAX_STORE_BYTES = 1024 * 1024


class CaseStore:
    """Keep metadata-only history in memory unless a path is explicitly supplied."""

    def __init__(self, path: Path | None = None, max_records: int = 100) -> None:
        self.path = path
        self.max_records = max_records
        self._lock = threading.RLock()
        self._records = self._read() if path else []

    @property
    def persistent(self) -> bool:
        return self.path is not None

    def _read(self) -> list[dict[str, object]]:
        assert self.path is not None
        if not self.path.exists():
            return []
        try:
            if self.path.stat().st_size > MAX_STORE_BYTES:
                raise RuntimeError("history store exceeds the 1 MiB safety limit")
        except OSError as exc:
            raise RuntimeError(f"cannot inspect history store: {self.path}") from exc
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"cannot read history store: {self.path}") from exc
        if not isinstance(data, list):
            raise RuntimeError("history store must contain a JSON array")
        if not all(isinstance(item, dict) for item in data):
            raise RuntimeError("history store entries must be JSON objects")
        return data[-self.max_records :]

    def append(self, record: dict[str, object]) -> None:
        with self._lock:
            self._records = [*self._records, deepcopy(record)][-self.max_records :]
            if self.path:
                self._write_atomic()

    def all(self) -> list[dict[str, object]]:
        with self._lock:
            return deepcopy(list(reversed(self._records)))

    def clear(self) -> None:
        with self._lock:
            self._records.clear()
            if self.path:
                self._write_atomic()

    def _write_atomic(self) -> None:
        assert self.path is not None
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile(
            "w", encoding="utf-8", dir=self.path.parent, delete=False, suffix=".tmp"
        ) as handle:
            json.dump(self._records, handle, ensure_ascii=False, indent=2)
            temp_path = Path(handle.name)
        try:
            os.replace(temp_path, self.path)
        finally:
            temp_path.unlink(missing_ok=True)
