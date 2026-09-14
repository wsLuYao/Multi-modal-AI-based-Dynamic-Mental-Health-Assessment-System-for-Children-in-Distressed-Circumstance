"""Generate a small self-contained HTML review note."""

from __future__ import annotations

import os
import re
from html import escape
from pathlib import Path
from tempfile import NamedTemporaryFile

CASE_ID_PATTERN = re.compile(r"[A-Za-z0-9_-]{1,64}\Z")


def build_report_html(
    case_id: str,
    meta: dict[str, str],
    analysis: dict[str, object],
    output_dir: Path,
) -> Path:
    if not CASE_ID_PATTERN.fullmatch(case_id):
        raise ValueError("case_id contains unsupported characters")
    output_dir.mkdir(parents=True, exist_ok=True)
    score = float(analysis["risk_indicator"])
    rows = "".join(
        f"<tr><th>{escape(name)}</th><td>{float(value):.2f}</td></tr>"
        for name, value in dict(analysis["category_scores"]).items()
    )
    content = f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>文本信号复核记录 · {escape(case_id)}</title>
<style>
body{{max-width:760px;margin:48px auto;padding:0 24px;font:16px/1.65 system-ui;color:#18212f}}
h1{{color:#156b68}} .notice{{padding:14px 18px;border-left:4px solid #e59d23;background:#fff8e8}}
table{{width:100%;border-collapse:collapse}}
th,td{{padding:10px;border-bottom:1px solid #dde5e7;text-align:left}}
.pill{{display:inline-block;padding:3px 10px;border-radius:99px;background:#e0f4f2;color:#075b57}}
@media print{{body{{margin:0}}}}
</style></head><body>
<p class="pill">Research prototype · 研究原型</p>
<h1>文本信号复核记录</h1>
<p>个案代号：{escape(meta.get("alias", "未填写"))}<br>
年龄段：{escape(meta.get("age_group", "未填写"))}<br>
资料来源：{escape(meta.get("method", "未填写"))}</p>
<h2>演示结果</h2>
<p>主要线索类别：<strong>{escape(str(analysis["primary_category"]))}</strong><br>
人工复核优先级：<strong>{escape(str(analysis["review_priority"]))}</strong><br>
文本信号指标：<strong>{score:.2f}</strong></p>
<table><thead><tr><th>类别</th><th>关键词覆盖分</th></tr></thead>
<tbody>{rows}</tbody></table>
<h2>使用边界</h2>
<p class="notice">本记录由确定性关键词规则生成，仅用于软件研究与界面演示。
它不是心理测验、临床诊断、自动筛查或干预建议；任何实际个案必须由具备资质的
专业人员结合充分资料复核。</p>
</body></html>"""
    output_path = output_dir / f"{case_id}.html"
    with NamedTemporaryFile(
        "w", encoding="utf-8", dir=output_dir, delete=False, suffix=".tmp"
    ) as handle:
        handle.write(content)
        temp_path = Path(handle.name)
    try:
        os.replace(temp_path, output_path)
    finally:
        temp_path.unlink(missing_ok=True)
    return output_path
