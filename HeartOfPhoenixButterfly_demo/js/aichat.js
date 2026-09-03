/******************** DOM 快捷选择 ********************/
const $ = (sel) => document.querySelector(sel);

const dropzone = $("#dropzone");
const fileInput = $("#fileInput");
const filesList = $("#filesList");
const messages = $("#messages");
const input = $("#input");
const sendBtn = $("#sendBtn");
const attachBtn = $("#attachBtn");
const clearBtn = $("#clearBtn");

/******************** 主题切换 ********************/
const root = document.documentElement;
function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}
function toggleTheme() {
  const current = root.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
}
setTheme(localStorage.getItem("theme") || "dark");

/******************** 文件队列 ********************/
const queuedFiles = [];
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}

/******************** 渲染上传队列 ********************/
function renderFiles() {
  filesList.innerHTML = "";
  queuedFiles.forEach((f, idx) => {
    const el = document.createElement("div");
    el.className = "file-item";
    el.innerHTML = `
      <div style="flex:1">
        <strong>${f.file.name}</strong>
        <div class="progress"><i style="width:${f.progress || 0}%"></i></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn" data-upload="${idx}">上传</button>
        <button class="btn" data-remove="${idx}">移除</button>
      </div>
    `;
    filesList.appendChild(el);
  });
}

/******************** 拖拽上传 ********************/
["dragenter", "dragover"].forEach(ev => {
  dropzone.addEventListener(ev, e => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
});
["dragleave", "drop"].forEach(ev => {
  dropzone.addEventListener(ev, e => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  });
});
dropzone.addEventListener("drop", e => addFiles(Array.from(e.dataTransfer.files || [])));

/******************** 选择文件 ********************/
chooseBtn.onclick = () => fileInput.click();
fileInput.onchange = (e) => {
  addFiles(Array.from(e.target.files || []));
  fileInput.value = "";
};
function addFiles(files) {
  files.forEach(file => queuedFiles.push({ file, progress: 0, status: "idle" }));
  renderFiles();
}

/******************** 文件列表按钮操作 ********************/
filesList.onclick = async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  // 单文件上传
  if (btn.dataset.upload) {
    const idx = +btn.dataset.upload;
    const f = queuedFiles[idx];

    const nameValid = f.file.name.includes("个案原始数据");
    const typeValid = f.file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || f.file.name.endsWith(".docx");

    if (!nameValid || !typeValid) {
      addAIMessage("文件格式不符合系统格式，请重新上传。");
      return;
    }

    f.progress = 100;
    renderFiles();
    await generateReportCard();
  }

  // 删除文件
  if (btn.dataset.remove) {
    queuedFiles.splice(+btn.dataset.remove, 1);
    renderFiles();
  }
};

/******************** 全量上传 ********************/
attachBtn.onclick = async () => {
  if (!queuedFiles.length) {
    addAIMessage("当前没有待上传的文件。");
    return;
  }

  for (const f of queuedFiles) {
    const nameValid = f.file.name.includes("个案原始数据");
    const typeValid = f.file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || f.file.name.endsWith(".docx");

    if (!nameValid || !typeValid) {
      addAIMessage("文件格式不符合系统格式，请重新上传。");
      return;
    }
    f.progress = 100;
  }

  renderFiles();
  await generateReportCard();
};

/******************** 聊天发送 ********************/
sendBtn.onclick = sendMessageFromInput;
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessageFromInput();
  }
});
function sendMessageFromInput() {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addUserMessage(text);
  simulateAiReply(text);
}

/******************** 消息构造 ********************/
function addUserMessage(text) {
  const el = document.createElement("div");
  el.className = "msg user";
  el.textContent = text;
  messages.appendChild(el);
  scrollToBottom();
}
function addAIMessage(text) {
  const el = document.createElement("div");
  el.className = "msg ai";
  messages.appendChild(el);
  typeWriter(el, text);
  scrollToBottom();
}
function typeWriter(container, text, speed = 18) {
  let i = 0;
  container.textContent = "";
  const tick = () => {
    if (i < text.length) {
      container.textContent += text[i++];
      scrollToBottom();
      setTimeout(tick, speed);
    }
  };
  tick();
}

/******************** 滚动到底部 ********************/
function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

/******************** 报告卡片生成 ********************/

async function generateReportCard() {
  addAIMessage("分析报告生成中，请稍候...");
// 创建分析进度条消息
  const progressEl = document.createElement("div");
  progressEl.className = "msg ai";
  const bar = document.createElement("div");
  bar.className = "loading-bar";
  const inner = document.createElement("i");
  bar.appendChild(inner);
  progressEl.appendChild(bar);
  messages.appendChild(progressEl);
  scrollToBottom();

  // 模拟进度
  let p = 0;
  const iv = setInterval(() => {
    p += 10;
    inner.style.width = p + "%";
    scrollToBottom();
    if (p >= 100) {
      clearInterval(iv);
      // progressEl.remove(); // 移除进度条
      createReportCard();  // 生成报告卡片
    }
  }, 300);

  const report = {
    theme: "困境儿童心理健康评估报告",
    basicInfo: {
      姓名: "小明",
      年龄: 10,
      评估日期: "2025-12-23",
      评估方式: "心理量表+行为观察",
      评估人员: "心理咨询师张老师"
    },
    results: {
      困境类型: "学习压力+社交焦虑",
      风险等级: "中等",
      核心症状表现: "注意力不集中、回避社交、情绪波动"
    },
    trendData: {
      dates: ["周一","周二","周三","周四","周五"],
      score: [65,68,70,72,74],
      symptomDistribution: [30,20,25,25]
    },
    intervention: "建议加强家庭陪伴，开展认知行为干预训练，定期学校辅导和心理咨询。"
  };

  setTimeout(() => showReportCard(report), 500);
}

function showReportCard(report) {
  const el = document.createElement("div");
  el.className = "msg ai";

  const card = document.createElement("div");
  card.className = "card report-card";

  card.innerHTML = `
    <h3>${report.theme}</h3>
    <h4>基本信息</h4>
    <ul>
      ${Object.entries(report.basicInfo).map(([k,v])=>`<li>${k}: ${v}</li>`).join("")}
    </ul>
    <h4>评估结果</h4>
    <ul>
      ${Object.entries(report.results).map(([k,v])=>`<li>${k}: ${v}</li>`).join("")}
    </ul>
    <h4>变化趋势</h4>
    <canvas id="trendChart" height="150"></canvas>
    <canvas id="pieChart" height="150"></canvas>
    <h4>干预建议</h4>
    <p>${report.intervention}</p>
  `;

  el.appendChild(card);
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;

  const ctx1 = document.getElementById("trendChart").getContext("2d");
  new Chart(ctx1, {
    type: 'line',
    data: {
      labels: report.trendData.dates,
      datasets: [{
        label: '心理健康评分',
        data: report.trendData.score,
        borderColor: 'rgba(34, 211, 238, 0.8)',
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        fill: true,
        tension: 0.4
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  const ctx2 = document.getElementById("pieChart").getContext("2d");
  new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: ['学习压力','社交焦虑','情绪波动','其他'],
      datasets: [{
        data: report.trendData.symptomDistribution,
        backgroundColor: [
          'rgba(34, 211, 238, 0.6)',
          'rgba(124, 58, 237, 0.6)',
          'rgba(251, 191, 36,0.6)',
          'rgba(234, 88, 12,0.6)'
        ]
      }]
    },
    options: { responsive: true }
  });
}

/******************** 模拟 AI 回复 ********************/
function simulateAiReply(text) {
  setTimeout(() => addAIMessage("收到你的消息：" + text), 600);
}

/******************** 清空队列 ********************/
clearBtn.onclick = () => {
  queuedFiles.length = 0;
  renderFiles();
};

/******************** 初始欢迎 ********************/
addAIMessage(
  "你好！欢迎访问凤蝶智慧大模型。你可以拖拽个案数据文件到左侧区域，每个文件可单独上传，或点击“上传并分析”上传所有文件。待系统分析完成后会生成一份个案数据报告。"
);
