import json

import pytest

from phoenix_assessment.storage import MAX_STORE_BYTES, CaseStore


def test_memory_store_is_private_by_default() -> None:
    store = CaseStore()
    store.append({"case_id": "one"})
    assert store.persistent is False
    assert store.all() == [{"case_id": "one"}]


def test_persistent_store_is_atomic_and_capped(tmp_path) -> None:
    path = tmp_path / "history.json"
    store = CaseStore(path=path, max_records=2)
    for case_id in ("one", "two", "three"):
        store.append({"case_id": case_id})
    assert [item["case_id"] for item in store.all()] == ["three", "two"]
    assert [item["case_id"] for item in json.loads(path.read_text("utf-8"))] == ["two", "three"]
    assert not list(tmp_path.glob("*.tmp"))


def test_invalid_history_shape_fails_closed(tmp_path) -> None:
    path = tmp_path / "history.json"
    path.write_text('{"unexpected": true}', encoding="utf-8")
    with pytest.raises(RuntimeError, match="JSON array"):
        CaseStore(path)


def test_invalid_history_entry_fails_closed(tmp_path) -> None:
    path = tmp_path / "history.json"
    path.write_text('["unexpected"]', encoding="utf-8")
    with pytest.raises(RuntimeError, match="JSON objects"):
        CaseStore(path)


def test_oversized_history_fails_closed(tmp_path) -> None:
    path = tmp_path / "history.json"
    path.write_bytes(b" " * (MAX_STORE_BYTES + 1))
    with pytest.raises(RuntimeError, match="1 MiB"):
        CaseStore(path)
