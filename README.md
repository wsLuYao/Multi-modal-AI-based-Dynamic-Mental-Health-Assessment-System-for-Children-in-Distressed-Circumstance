<p align="center">
  <img src="docs/assets/hero.svg" alt="Phoenix Butterfly — explainable text signals, human judgement first" width="100%">
    <b>融合多模态感知的“LET”全周期困境儿童心理健康动态评估系统</b>
</p>

<p align="center">
  <strong>简体中文</strong> · <a href="README.en.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/wsLuYao/Multi-modal-AI-based-Dynamic-Mental-Health-Assessment-System-for-Children-in-Distressed-Circumstance/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/wsLuYao/Multi-modal-AI-based-Dynamic-Mental-Health-Assessment-System-for-Children-in-Distressed-Circumstance/actions/workflows/ci.yml/badge.svg"></a>
  <img alt="Python 3.10+" src="https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white">
  <img alt="Apache-2.0" src="https://img.shields.io/badge/License-Apache--2.0-0B7A75">
  <img alt="Synthetic data only" src="https://img.shields.io/badge/Data-synthetic%20only-E49B25">
  <img alt="Research prototype" src="https://img.shields.io/badge/Status-research%20prototype-6B7280">
</p>

> 一个隐私优先、可解释的中文文本信号研究原型：在本地读取去标识化 DOCX，以透明规则呈现线索，并把最终判断留给专业人员。

## 先看这里

| 当前版本 | 状态 |
| --- | --- |
| 中文 DOCX 文本提取 | ✅ 已实现，内存处理 |
| 五类关键词覆盖与复核优先级 | ✅ 已实现，确定性规则 |
| 本地 HTML 复核记录 | ✅ 已实现，需显式开启写盘 |
| 语音、图像、微表情、量表、行为轨迹 | **尚未实现** |
| 经验证的临床模型或准确率 | **没有** |

本项目不是医疗器械、心理测验或临床决策系统，不得用于自动诊断、独立筛查、危机结论、处分、服务资格或资源分配。界面中的“文本信号指标”和“人工复核优先级”是软件演示值，不是患病概率或临床风险等级。

## 为什么值得一看

- **隐私默认安全**：上传文件不落盘，分析结果不返回原文，历史与 HTML 记录默认均不写盘。
- **结果可解释**：每个类别都能追溯到明确关键词；分值含义写在[模型卡](docs/model-card.md)中。
- **不依赖黑盒服务**：无云端 API、无密钥、无遥测，核心流程可离线运行。
- **演示与事实分离**：静态仪表板全部标注为合成数据；不再展示虚构准确率或运营规模。
- **可验证**：包含单元/集成测试、发布树隐私扫描、Python 静态检查和 JavaScript 语法 CI。

## 快速开始

需要 Python 3.10–3.12。建议只使用仓库附带的合成材料。

```bash
git clone https://github.com/wsLuYao/Multi-modal-AI-based-Dynamic-Mental-Health-Assessment-System-for-Children-in-Distressed-Circumstance.git
cd Multi-modal-AI-based-Dynamic-Mental-Health-Assessment-System-for-Children-in-Distressed-Circumstance

python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
python -m pip install -e ".[desktop]"

python scripts/make_demo_docx.py
phoenix-assessment
```

生成的合成 DOCX 位于 `runtime/synthetic_case.docx`。`runtime/` 已被 Git 忽略。
应用默认不会写入历史或 HTML 记录；如确需本地可打印记录，请先阅读[数据与伦理指南](docs/data-and-ethics.md)，再显式设置 `PHOENIX_WRITE_REPORTS=1`。

只想查看不连接后端的视觉原型：

```bash
python -m http.server 8000 --directory prototypes/dashboard
```

然后打开 `http://localhost:8000`。页面中的数字均为固定合成占位数据。

## 工作原理

```mermaid
flowchart LR
    A[去标识化 DOCX] --> B[大小与结构校验]
    B --> C[内存文本提取]
    C --> D[透明关键词规则]
    D --> E[类别覆盖分]
    D --> F[复核优先级]
    E --> G[可选本地复核记录]
    F --> G
    G --> H[专业人员最终判断]
```

类别覆盖分是“命中的预设词数 ÷ 该类别词表大小”，各类别独立计算，因此**不是概率且总和不必等于 1**。启发式文本信号指标还组合了少量情绪词、第一人称出现次数、文本长度和优先复核词；它没有临床阈值。详见[模型卡](docs/model-card.md)与[架构说明](docs/architecture.md)。

## 项目结构

```text
.
├─ src/phoenix_assessment/   # Python 核心、pywebview 桥接与桌面界面
├─ prototypes/dashboard/     # 仅含合成数据的视觉设计原型
├─ examples/                 # 完全合成的文本样例
├─ scripts/                  # 生成演示 DOCX 与发布树审计
├─ tests/                    # 单元与端到端测试
├─ docs/                     # 架构、模型卡、数据伦理与整理说明
└─ .github/                  # CI、Issue 与 PR 模板
```

## 测试

```bash
python -m pip install -e ".[dev]"
ruff check .
python scripts/audit_publish_tree.py
pytest
```

## 数据与伦理

仓库不包含真实个人数据、既往评估历史、生成报告、临时文件、专利申请材料或训练数据。开发、测试、截图和 Issue 必须使用合成材料。若要处理真实个案，请先建立合法依据、知情/监护同意、去标识化、访问控制、保留与删除机制、伦理审查、专业复核和危机升级流程；本仓库没有提供这些生产控制。

请在使用前完整阅读[数据与伦理指南](docs/data-and-ethics.md)和[安全策略](SECURITY.md)。早期原型与当前实现的对应关系见[原型整理说明](docs/prototype-notes.md)。

## 路线图

- [ ] 邀请心理、儿童保护、数据治理与可用性专家共同评审词表及界面
- [ ] 增加否定、引语和上下文测试，减少机械关键词误判
- [ ] 建立完全合成的跨场景评测集与误差报告
- [ ] 设计可审计的模态适配器接口（不等同于已经实现多模态）
- [ ] 在任何真实部署之前完成独立伦理、安全、偏差与临床效用评估

欢迎先阅读[贡献指南](CONTRIBUTING.md)。涉及规则或输出含义的改动，必须同步更新算法版本、模型卡和测试。

## 许可证

代码以 [Apache License 2.0](LICENSE) 开源。该许可证不授予任何第三方商标权，也不代表软件获得临床、监管或机构认可。
