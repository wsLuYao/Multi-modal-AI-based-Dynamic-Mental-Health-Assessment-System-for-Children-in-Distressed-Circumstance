import base64
from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile

import pytest

from phoenix_assessment.document import (
    MAX_BASE64_CHARS,
    MAX_UNCOMPRESSED_BYTES,
    DocumentValidationError,
    decode_base64_document,
    extract_docx_text,
)


def test_base64_round_trip(docx_bytes: bytes) -> None:
    encoded = base64.b64encode(docx_bytes).decode("ascii")
    assert decode_base64_document(encoded) == docx_bytes


def test_data_url_prefix_is_supported(docx_bytes: bytes) -> None:
    encoded = "data:application/octet-stream;base64," + base64.b64encode(docx_bytes).decode("ascii")
    assert decode_base64_document(encoded) == docx_bytes


def test_invalid_base64_is_rejected() -> None:
    with pytest.raises(DocumentValidationError, match="base64"):
        decode_base64_document("not!base64")


def test_oversized_encoded_payload_is_rejected_before_decoding() -> None:
    with pytest.raises(DocumentValidationError, match="5 MiB"):
        decode_base64_document("A" * (MAX_BASE64_CHARS + 1))


def test_docx_paragraphs_and_tables_are_extracted(docx_bytes: bytes) -> None:
    text = extract_docx_text(docx_bytes)
    assert "完全合成" in text
    assert "资料来源 | 合成叙事" in text


def test_non_docx_zip_is_rejected() -> None:
    with pytest.raises(DocumentValidationError, match="readable Word DOCX"):
        extract_docx_text(b"not a docx")


def test_highly_expanded_docx_is_rejected_before_xml_parsing() -> None:
    buffer = BytesIO()
    with ZipFile(buffer, "w", compression=ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", "<Types />")
        archive.writestr("word/document.xml", b"x" * MAX_UNCOMPRESSED_BYTES)
        archive.writestr("word/overflow.bin", b"x")
    with pytest.raises(DocumentValidationError, match="expanded DOCX"):
        extract_docx_text(buffer.getvalue())
