# Data & Ethics Guide / 数据与伦理指南

## 开始之前

本仓库只附带合成文本。即使你有权使用某份材料，也不代表它适合进入代码仓库、问题工单、截图、演示录屏或第三方服务。儿童相关信息属于高度敏感资料；请让数据保护负责人、伦理审查机制和具备资质的心理专业人员共同参与部署决策。

### 最低实践要求

1. **先用合成数据。** 开发、测试、截图和 CI 一律使用虚构内容。
2. **去除直接与间接标识符。** 姓名、证件号、联系方式、学校、精确住址、精确生日、罕见事件组合等都可能重新识别个人。
3. **数据最小化。** 只处理完成当前研究问题所需的字段；本界面使用“个案代号”和“年龄段”，不收集姓名。
4. **限定目的和期限。** 在采集前确定合法依据、知情同意/监护同意、访问者、保存位置、保留期限和删除方式。
5. **禁止自动决定。** 不把规则输出用于诊断、处分、服务资格、资源分配或危机结论。
6. **建立人工通道。** 明确谁复核、如何覆盖系统输出、如何记录异议、如何升级紧急情况。
7. **持续评估伤害。** 检查漏报、误报、群体差异、标签化、污名化和自动化偏见。

### 本地持久化

默认历史和 HTML 记录均不写入磁盘。若研究方案确实需要本地持久化，可分别显式设置：

```powershell
$env:PHOENIX_PERSIST_HISTORY = "1"
$env:PHOENIX_WRITE_REPORTS = "1"
phoenix-assessment
```

这些选项会创建本地 JSON 和/或 HTML 文件，并不提供加密、账号体系、细粒度权限、审计日志、备份或删除审批。请只启用确实需要的选项；生产环境不得直接依赖它们。

## Before you begin

The repository contains synthetic text only. Having permission to use a record does not make it suitable for a source repository, issue tracker, screenshot, recording, or third-party service. Involve data-protection, ethics, safeguarding, and qualified mental-health professionals before any real-world deployment.

At minimum: use synthetic development data; remove direct and indirect identifiers; minimize fields; establish purpose, lawful basis, consent, access, retention, and deletion; prohibit automated consequential decisions; provide human review and override; and continuously assess false positives, false negatives, group disparities, stigma, and automation bias. Disk history and HTML-note output are both disabled by default; enable `PHOENIX_PERSIST_HISTORY` and `PHOENIX_WRITE_REPORTS` independently only after governance review.
