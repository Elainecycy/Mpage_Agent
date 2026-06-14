# 模型冒烟包（迭代 0 · 任务 0.3）

对应 [开发迭代计划](../docs/development-iteration-plan.md) 准备期任务 0.3：拿标准示例让公司能用的候选模型各生成几次，量化对比后选出 MVP 默认模型。

## 文件说明

| 文件 | 作用 |
|------|------|
| `system_prompt.md` | 给模型的完整指令：角色 + 工作步骤 + 规则 + 组件字段速查 + 附录 A 完整示例（无坐标版） |
| `cases.json` | 5 个测试用例，由易到难（基本格式 → 结构组装 → 卡片选型 → 编造 URL 诱导 → 文案保真） |
| `smoke_check.py` | 判分脚本：JSON 可解析、root/children 闭合、path 可解析、URL 白名单、文案原样保留等 |
| `run_smoke.py` | 跑批入口：模型 × 用例 × 次数，输出明细 CSV + 汇总表 |

## 使用

```bash
# 1. 配置公司模型网关（OpenAI 兼容接口；不兼容时改 run_smoke.py 的 call_model 函数）
#    密钥一律走环境变量，切勿把真实值写进任何会提交的文件。
export SMOKE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
export SMOKE_API_KEY=<你的网关密钥>

# 2. 先看看拼好的 prompt 长什么样（不调模型）
python3 run_smoke.py --models any --dry-run

# 3. 正式跑批：候选模型逗号分隔，每个用例各跑 5 次
python3 run_smoke.py --models "model-a,model-b,model-c" --repeats 5

# 4. 网关支持 JSON mode 的话，加开关再跑一轮对比
python3 run_smoke.py --models "model-a,model-b,model-c" --repeats 5 --json-mode
```

产出：

- `results.csv` — 每次调用的明细（是否通过、问题列表、是否编造 URL、延迟）
- `outputs/` — 每次的模型原始输出，便于人工复盘
- 终端汇总表 — 每个模型的一次通过率 / 编造 URL 次数 / 平均延迟 / 高频错误类型

## 判读标准

| 现象 | 结论 |
|------|------|
| 一次通过率 ≥ 90% | 可作为 MVP 默认模型候选（正式版还有一次自动重试兜底） |
| 一次通过率明显 < 90% | 不建议进入第 1 期 |
| 编造 URL 次数 > 0 | 重点标记——这是上线后最危险的错误类型（case4 专门埋了诱导） |
| 所有模型挂在同一类错误 | 是格式设计的问题不是模型的问题，回到任务 0.1 调整 Schema 自由度 |

## 注意事项

- 温度固定 0.2（结构化输出场景），对比模型时不要改温度，保证可比性
- 测试用例主题刻意与 system prompt 中的示例（新春理财）不同，防止模型靠抄示例蒙混过关
- 用例中的素材 URL 是测试占位地址，模型只需引用、不会真实访问，无需替换；若公司网关有出参审计，可换成内网真实测试图地址
- 跑批结论记入迭代 0 的冒烟记录，包含：默认模型决议、各模型通过率表、遗留问题
