"use strict";

const form = document.querySelector("#assessment-form");
const fileInput = document.querySelector("#case-file");
const fileLabel = document.querySelector("#file-label");
const submitButton = document.querySelector("#submit-button");
const status = document.querySelector("#status");
const emptyResult = document.querySelector("#empty-result");
const result = document.querySelector("#result");
const resultState = document.querySelector("#result-state");
const categoryBars = document.querySelector("#category-bars");
const historyList = document.querySelector("#history");
const storageMode = document.querySelector("#storage-mode");
const clearHistoryButton = document.querySelector("#clear-history");

function bridge() {
  if (!window.pywebview?.api) {
    throw new Error("请通过桌面应用启动此页面（python -m phoenix_assessment）。");
  }
  return window.pywebview.api;
}

function fileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1]);
    reader.onerror = () => reject(new Error("无法读取所选文件。"));
    reader.readAsDataURL(file);
  });
}

function setStatus(message, kind = "") {
  status.textContent = message;
  status.dataset.kind = kind;
}

function formatTime(isoTime) {
  const parsed = new Date(isoTime);
  return Number.isNaN(parsed.valueOf()) ? "" : parsed.toLocaleString("zh-CN");
}

function renderBars(scores) {
  categoryBars.replaceChildren();
  Object.entries(scores).forEach(([label, rawScore]) => {
    const score = Math.max(0, Math.min(1, Number(rawScore)));
    const row = document.createElement("div");
    row.className = "bar-row";
    const heading = document.createElement("div");
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("strong");
    value.textContent = score.toFixed(2);
    heading.append(name, value);
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("i");
    fill.style.width = `${Math.round(score * 100)}%`;
    track.append(fill);
    row.append(heading, track);
    categoryBars.append(row);
  });
}

function renderResult(record) {
  const analysis = record.analysis;
  document.querySelector("#primary-category").textContent = analysis.primary_category;
  document.querySelector("#review-priority").textContent = analysis.review_priority;
  document.querySelector("#risk-indicator").textContent = Number(analysis.risk_indicator).toFixed(2);
  document.querySelector("#urgent-note").hidden = !analysis.urgent_review_required;
  const reportLink = document.querySelector("#report-link");
  reportLink.hidden = !record.report_uri;
  if (record.report_uri) {
    reportLink.href = record.report_uri;
  } else {
    reportLink.removeAttribute("href");
  }
  renderBars(analysis.category_scores);
  emptyResult.hidden = true;
  result.hidden = false;
  resultState.textContent = "已生成";
  resultState.classList.add("ready");
}

function historyItem(record) {
  const article = document.createElement("article");
  const info = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = record.meta.alias || "未命名演示个案";
  const meta = document.createElement("small");
  meta.textContent = `${record.analysis.primary_category} · ${formatTime(record.created_at)}`;
  info.append(title, meta);
  const priority = document.createElement("span");
  priority.textContent = record.analysis.review_priority;
  article.append(info, priority);
  return article;
}

async function refreshHistory() {
  try {
    const response = await bridge().load_history();
    historyList.replaceChildren();
    storageMode.textContent = response.persistent
      ? "已显式启用本地历史；请按数据治理规范管理 runtime/history.json。"
      : "历史仅保存在当前会话，关闭应用后不保留。";
    if (response.reports_enabled) {
      storageMode.textContent += " 可打印记录会写入 runtime/reports/。";
    } else {
      storageMode.textContent += " 可打印记录写盘功能未启用。";
    }
    if (!response.items.length) {
      const empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = "暂无记录";
      historyList.append(empty);
      return;
    }
    response.items.forEach((item) => historyList.append(historyItem(item)));
  } catch (error) {
    storageMode.textContent = error.message;
  }
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileLabel.textContent = file ? file.name : "选择一个 DOCX 文件";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".docx")) {
    setStatus("仅支持 DOCX 文件。", "error");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setStatus("文件超过 5 MiB 限制。", "error");
    return;
  }

  submitButton.disabled = true;
  resultState.textContent = "分析中";
  setStatus("正在内存中解析与计算透明规则…", "working");
  try {
    const encoded = await fileAsBase64(file);
    const meta = {
      alias: document.querySelector("#alias").value,
      age_group: document.querySelector("#age-group").value,
      method: document.querySelector("#method").value,
    };
    const response = await bridge().analyze_case(meta, encoded);
    renderResult(response);
    await refreshHistory();
    setStatus("完成。请结合完整材料进行人工复核。", "success");
  } catch (error) {
    resultState.textContent = "处理失败";
    setStatus(error.message || "处理失败，请检查文件。", "error");
  } finally {
    submitButton.disabled = false;
  }
});

clearHistoryButton.addEventListener("click", async () => {
  try {
    await bridge().clear_history();
    await refreshHistory();
    setStatus("会话记录已清空。", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

window.addEventListener("pywebviewready", refreshHistory);
