"use strict";

const categories = [
  ["监护支持不足", 0.4],
  ["家庭功能压力", 0.6],
  ["经济生活压力", 0.2],
  ["忽视或伤害线索", 0.3],
  ["行为适应困难", 0.2],
];

const syntheticCases = [
  ["DEMO-014", "常规人工复核", "12–14 岁"],
  ["DEMO-011", "信息有限", "6–11 岁"],
  ["DEMO-009", "优先人工复核", "15–17 岁"],
  ["DEMO-006", "常规人工复核", "未填写"],
];

const categoryList = document.querySelector("#category-list");
categories.forEach(([name, score]) => {
  const item = document.createElement("div");
  const label = document.createElement("div");
  label.innerHTML = `<span>${name}</span><b>${score.toFixed(2)}</b>`;
  const bar = document.createElement("i");
  bar.style.setProperty("--score", `${score * 100}%`);
  item.append(label, bar);
  categoryList.append(item);
});

const queue = document.querySelector("#queue");
function renderQueue(items) {
  queue.replaceChildren();
  items.forEach(([alias, priority, group]) => {
    const row = document.createElement("div");
    const identity = document.createElement("div");
    const title = document.createElement("strong");
    const detail = document.createElement("small");
    title.textContent = alias;
    detail.textContent = `${group} · 合成数据`;
    identity.append(title, detail);
    const badge = document.createElement("span");
    badge.textContent = priority;
    badge.dataset.priority = priority.startsWith("优先") ? "high" : "normal";
    row.append(identity, badge);
    queue.append(row);
  });
}
renderQueue(syntheticCases);

document.querySelector("#refresh").addEventListener("click", () => {
  renderQueue([...syntheticCases].reverse());
});

document.querySelector("#clock").textContent = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "long",
}).format(new Date());
