"""Desktop entry point."""

from __future__ import annotations

import os
from importlib.resources import files

from .api import from_environment


def main() -> None:
    try:
        import webview
    except ImportError as exc:  # pragma: no cover - depends on desktop environment
        raise SystemExit("Install desktop dependencies with: pip install -e '.[desktop]'") from exc

    index = files("phoenix_assessment").joinpath("web/index.html")
    webview.create_window(
        "凤蝶之心 · 文本信号分析研究原型",
        str(index),
        js_api=from_environment(),
        width=1180,
        height=780,
        min_size=(860, 620),
    )
    debug = os.environ.get("PHOENIX_DEBUG", "").lower() in {"1", "true", "yes"}
    webview.start(debug=debug)
